import { defineStore } from 'pinia'
import { api } from '../boot/ssoAxios.js'
import { Notify } from 'quasar'
import { Cookies } from 'quasar'

// Маппинг OAuth ошибок на человекочитаемые сообщения
const ERROR_MESSAGES = {
  'access_denied': 'Доступ запрещен. Вы отклонили запрос на авторизацию.',
  'invalid_request': 'Неверный запрос авторизации.',
  'unauthorized_client': 'Приложение не авторизовано.',
  'unsupported_response_type': 'Тип ответа не поддерживается.',
  'invalid_scope': 'Недопустимая область доступа.',
  'server_error': 'Ошибка сервера авторизации. Попробуйте позже.',
  'temporarily_unavailable': 'Сервер авторизации временно недоступен.',
  'invalid_state': 'Недопустимый state параметр. Возможная CSRF атака.',
  'default': 'Произошла ошибка авторизации. Попробуйте снова.'
}

/**
 * Pinia store для аутентификации через SSO sso.jetgoods.ru.
 *
 * Особенности:
 * - access_token хранится ТОЛЬКО в памяти (теряется при перезагрузке)
 * - refresh_token хранится в HTTP-only cookie (недоступен JS)
 * - Поддерживает множественные организации
 * - Автоматический refresh токена при 401 ошибке
 *
 * @example
 *   import { useAuthStore } from 'jetgoods-sso-ui'
 *   const authStore = useAuthStore()
 *   await authStore.login()
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshPromise: null,
    organizations: [],
    selectedOrganizationId: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    hasMultipleOrganizations: (state) => state.organizations.length > 1,
    currentOrganization: (state) => {
      return state.organizations.find(org => org.organizationId === state.selectedOrganizationId)
    }
  },

  actions: {
    setTokens(accessToken, organizations = []) {
      console.debug('[authStore] Setting access token and organizations')
      this.accessToken = accessToken
      this.organizations = organizations
      this.selectOrganization(organizations)
    },

    selectOrganization(organizations) {
      const savedOrgId = Cookies.get('selected_organization_id')

      if (organizations.length === 0) {
        this.selectedOrganizationId = null
        Cookies.remove('selected_organization_id')
        return
      }

      if (savedOrgId && organizations.some(org => org.organizationId === savedOrgId)) {
        this.selectedOrganizationId = savedOrgId
        console.debug('[authStore] Selected saved organization:', savedOrgId)
      } else {
        this.selectedOrganizationId = organizations[0].organizationId
        console.debug('[authStore] Selected first organization:', this.selectedOrganizationId)
        this.saveSelectedOrganization(this.selectedOrganizationId)
      }
    },

    saveSelectedOrganization(organizationId) {
      this.selectedOrganizationId = organizationId
      Cookies.set('selected_organization_id', organizationId, {
        expires: 365,
        path: '/',
        sameSite: 'Strict'
      })
      console.debug('[authStore] Saved selected organization to cookies:', organizationId)
    },

    clearTokens() {
      console.debug('[authStore] Clearing tokens')
      this.accessToken = null
      this.refreshPromise = null
      this.organizations = []
      this.selectedOrganizationId = null
    },

    async login() {
      try {
        console.info('[authStore] Initiating login flow')

        const returnUrl = window.location.pathname + window.location.search
        if (returnUrl !== '/' && returnUrl !== '/login') {
          console.debug('[authStore] Saving return URL:', returnUrl)
          sessionStorage.setItem('auth_return_url', returnUrl)
        }

        const response = await api.get('/auth/login-url')
        const loginUrl = response.data.loginUrl

        console.info('[authStore] Redirecting to SSO:', loginUrl)
        window.location.href = loginUrl
      } catch (error) {
        console.error('[authStore] Failed to initiate login:', error)
        Notify.create({
          type: 'negative',
          message: 'Не удалось начать процесс авторизации',
          caption: error.message
        })
        throw error
      }
    },

    async refreshAccessToken() {
      if (this.refreshPromise) {
        console.debug('[authStore] Refresh already in progress, waiting...')
        return this.refreshPromise
      }

      console.info('[authStore] Starting token refresh')

      this.refreshPromise = (async () => {
        try {
          const response = await api.post('/auth/token_proxy')
          const data = response.data
          this.setTokens(data.access_token, data.organizations || [])
          console.info('[authStore] Token refresh successful')
          return true
        } catch (error) {
          console.error('[authStore] Token refresh failed:', error.response?.status, error.message)
          this.clearTokens()

          const currentPath = window.location.pathname
          if (currentPath !== '/' && currentPath !== '/login') {
            console.debug('[authStore] Saving current URL before redirect:', currentPath)
            sessionStorage.setItem('auth_return_url', currentPath + window.location.search)
          }

          if (currentPath !== '/' && currentPath !== '/login') {
            console.info('[authStore] Redirecting to login page')
            window.location.href = '/'
          }

          return false
        } finally {
          this.refreshPromise = null
        }
      })()

      return this.refreshPromise
    },

    async logout() {
      console.info('[authStore] Logging out')
      try {
        await api.post('/auth/logout')
        console.info('[authStore] Logout successful')
      } catch (error) {
        console.error('[authStore] Logout error:', error)
      } finally {
        this.clearTokens()
        sessionStorage.removeItem('auth_return_url')
      }
    },

    async initAuth() {
      console.info('[authStore] Initializing authentication')
      try {
        const result = await this.refreshAccessToken()
        console.info('[authStore] Auth initialization result:', result)
        return result
      } catch (error) {
        console.debug('[authStore] Auth initialization failed - no valid refresh token')
        return false
      }
    },

    async handleCallbackParams(params) {
      const code = params.get('code')
      const state = params.get('state')
      const error = params.get('error')
      const errorDescription = params.get('error_description')

      if (error) {
        console.error('[authStore] OAuth error:', error, errorDescription)
        const errorMessage = ERROR_MESSAGES[error] || ERROR_MESSAGES['default']

        Notify.create({
          type: 'negative',
          message: 'Ошибка авторизации',
          caption: errorDescription || errorMessage,
          timeout: 5000,
          actions: [{ label: 'Закрыть', color: 'white' }]
        })

        window.history.replaceState({}, document.title, '/login')
        return { success: false }
      }

      if (code && state) {
        console.info('[authStore] Processing OAuth callback with code and state')

        try {
          const response = await api.post('/auth/token_proxy', { code, state })
          const data = response.data
          this.setTokens(data.access_token, data.organizations || [])
          console.info('[authStore] Successfully exchanged code for tokens')

          const returnUrl = sessionStorage.getItem('auth_return_url')
          sessionStorage.removeItem('auth_return_url')

          const targetUrl = returnUrl || '/'
          console.info('[authStore] Target URL after auth:', targetUrl)

          return { success: true, targetUrl }
        } catch (error) {
          console.error('[authStore] Failed to exchange code for tokens:', error.response?.status, error.message)

          const errorData = error.response?.data
          let errorMessage = 'Не удалось завершить авторизацию'

          if (errorData?.error === 'invalid_state') {
            errorMessage = ERROR_MESSAGES['invalid_state']
          } else if (errorData?.error_description) {
            errorMessage = errorData.error_description
          }

          Notify.create({
            type: 'negative',
            message: 'Ошибка обмена кода авторизации',
            caption: errorMessage,
            timeout: 5000,
            actions: [{ label: 'Закрыть', color: 'white' }]
          })

          window.history.replaceState({}, document.title, '/login')
          return { success: false }
        }
      }

      console.debug('[authStore] No callback params to handle')
      return { success: false }
    }
  }
})