// JetGoods SSO UI — package entry point
//
// Импортируйте всё необходимое из одного места:
//   import { createSsoApi, useAuthStore, createAuthGuard, authGuard, LoginPage, LoginLayout, CookieConsent } from 'jetgoods-sso-ui'

export { createSsoApi, api } from './boot/ssoAxios.js'
export { useAuthStore } from './stores/authStore.js'
export { createAuthGuard, createAuthGuard as authGuard } from './router/authGuard.js'
export { default as CookieConsent } from './components/CookieConsent.vue'
export { default as LoginPage } from './pages/LoginPage.vue'
export { default as LoginLayout } from './layouts/LoginLayout.vue'