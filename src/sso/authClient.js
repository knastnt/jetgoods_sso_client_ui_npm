import { getActivePinia } from 'pinia'
import { api } from '../boot/ssoAxios.js'
import { useAuthStore } from '../stores/authStore.js'

export function createSsoAuth({ store = null, axiosInstance = api } = {}) {
  const authStore = store ?? (getActivePinia() ? useAuthStore() : null)

  if (!authStore) {
    throw new Error('Pinia is not active. Initialize Pinia before creating the SSO auth client.')
  }

  return {
    getStore() {
      return authStore
    },
    get isAuthenticated() {
      return authStore.isAuthenticated
    },
    get user() {
      return authStore.user
    },
    get organizations() {
      return authStore.organizations
    },
    get selectedOrganizationId() {
      return authStore.selectedOrganizationId
    },
    async login() {
      return authStore.login()
    },
    async logout() {
      return authStore.logout()
    },
    async initAuth() {
      return authStore.initAuth()
    },
    async refreshAccessToken() {
      return authStore.refreshAccessToken()
    },
    async handleCallbackParams(params) {
      return authStore.handleCallbackParams(params)
    },
    getApi() {
      return axiosInstance
    }
  }
}

export function createSsoSession() {
  return createSsoAuth()
}
