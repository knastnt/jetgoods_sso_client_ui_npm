import axios from 'axios'
import { useAuthStore } from '../stores/authStore.js'

/**
 * Создаёт и настраивает axios-инстанс с перехватчиками для SSO аутентификации.
 *
 * - Добавляет Bearer токен к запросам (кроме /auth/ эндпоинтов)
 * - Автоматически обновляет токен при 401 ошибке
 * - Все запросы идут с withCredentials: true (HttpOnly cookies)
 *
 * @param {string} baseURL - Базовый URL для API (по умолчанию '/api')
 * @returns {AxiosInstance} настроенный axios-инстанс
 */
export function createSsoApi(baseURL = '/api') {
  const api = axios.create({
    baseURL,
    withCredentials: true
  })

  // Interceptor: добавляет Bearer токен (кроме auth-эндпоинтов)
  api.interceptors.request.use((config) => {
    const isAuthEndpoint = config.url?.startsWith('/auth/')

    if (!isAuthEndpoint) {
      const authStore = useAuthStore()
      if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`
      }
    }

    return config
  }, (error) => {
    return Promise.reject(error)
  })

  // Interceptor: автоматический refresh токена при 401
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const isAuthEndpoint = originalRequest.url?.startsWith('/auth/')

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true

        const authStore = useAuthStore()
        const refreshed = await authStore.refreshAccessToken()

        if (refreshed) {
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
          return api(originalRequest)
        }
      }

      return Promise.reject(error)
    }
  )

  return api
}

/**
 * Предустановленный экземпляр api для импорта в приложении.
 */
export const api = createSsoApi()