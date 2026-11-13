import { useAuthStore } from '../stores/authStore.js'

/**
 * Маршруты, которые публичны всегда. Приложение может только дополнять этот список.
 */
const DEFAULT_PUBLIC_ROUTES = ['/login']

/**
 * Проверяет, подходит ли путь под одно из правил.
 * Правило: строка (точное совпадение), RegExp или функция (path) => boolean.
 */
const matchesRule = (path, rule) => {
    if (typeof rule === 'string') return rule === path
    if (rule instanceof RegExp) return rule.test(path)
    if (typeof rule === 'function') return Boolean(rule(path))
    return false
}

/**
 * Создаёт navigation guard для Vue Router 4.
 * Проверяет аутентификацию перед переходом на защищённые страницы.
 *
 * Страница считается публичной, если выполняется хотя бы одно условие:
 *   - путь входит в DEFAULT_PUBLIC_ROUTES ('/', '/login', '/api-docs');
 *   - путь подходит под одно из правил в options.publicRoutes;
 *   - у маршрута (или любого родительского) указано meta: { public: true };
 *   - путь совпадает с options.redirectTo (чтобы не было цикла редиректов).
 *
 * @example
 *   // router/index.js
 *   import { createAuthGuard } from 'jetgoods-sso-ui'
 *
 *   Router.beforeEach(createAuthGuard({
 *     publicRoutes: ['/terms', /^\/docs\//],
 *   }))
 *
 * @example
 *   // пометка прямо в маршруте
 *   { path: '/terms', component: Terms, meta: { public: true } }
 *
 * @param {Object} [options]
 * @param {Array<string|RegExp|Function>} [options.publicRoutes=[]] - дополнительные публичные маршруты
 * @param {string} [options.redirectTo='/'] - куда отправлять неавторизованного пользователя
 * @returns {Function} guard для Router.beforeEach
 */
export const createAuthGuard = ({
                                    publicRoutes = [],
                                    redirectTo = '/',
                                } = {}) => {
    const rules = [...DEFAULT_PUBLIC_ROUTES, redirectTo, ...publicRoutes]

    return async (to) => {
        const isPublic =
            to.matched.some((record) => record.meta?.public === true) ||
            rules.some((rule) => matchesRule(to.path, rule))

        if (isPublic) return true

        const authStore = useAuthStore()

        if (authStore.isAuthenticated) return true

        const refreshed = await authStore.refreshAccessToken()

        return refreshed ? true : redirectTo
    }
}

/**
 * Guard с настройками по умолчанию.
 * Оставлен для обратной совместимости: Router.beforeEach(authGuard)
 */
export const authGuard = createAuthGuard()