import { useAuthStore } from '../stores/authStore.js'

/**
 * Navigation guard для Vue Router.
 * Проверяет аутентификацию перед переходом на защищённые страницы.
 *
 * Публичные маршруты (не требующие авторизации):
 *   '/', '/login', '/api-docs'
 *
 * @example
 *   // в router/index.js
 *   import { authGuard } from 'jetgoods-sso-ui'
 *   Router.beforeEach(authGuard)
 *
 * @param {Route} to - целевой маршрут
 * @param {Route} from - исходный маршрут
 * @param {Function} next - функция продолжения
 */
export const authGuard = async (to, from, next) => {
  const publicRoutes = ['/', '/login', '/api-docs']

  if (publicRoutes.includes(to.path)) {
    next()
    return
  }

  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    next()
    return
  }

  const refreshed = await authStore.refreshAccessToken()

  if (refreshed) {
    next()
  } else {
    next('/')
  }
}