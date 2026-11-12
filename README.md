# JetGoods SSO UI

Модуль аутентификации для Quasar/Vue проектов через единую систему входа **sso.jetgoods.ru**.

Позволяет легко добавить OAuth2-аутентификацию в любой Quasar-проект без написания кода авторизации.

## Установка

```bash
npm install git+https://github.com/knastnt/jetgoods-sso-ui.git
```

## Использование

```js
import { createSsoApi, useAuthStore, authGuard, LoginPage, LoginLayout, CookieConsent } from 'jetgoods-sso-ui'
```

### 1. Подключить boot-файл

В `quasar.config.js` добавьте `'sso-axios'` в секцию `boot`:

```js
boot: ['pinia', 'sso-axios'],
```

### 2. Создать boot-файл `src/boot/sso-axios.js`:

```js
import { defineBoot } from '#q-app/wrappers'
import { api } from 'jetgoods-sso-ui'

export default defineBoot(({ app }) => {
  app.config.globalProperties.$api = api
})

export { api }
```

### 3. Подключить authGuard

```js
import { authGuard } from 'jetgoods-sso-ui'

Router.beforeEach(authGuard)
```

### 4. Добавить маршруты

```js
import loginLayout from 'jetgoods-sso-ui'
import loginPage from 'jetgoods-sso-ui'

{ path: '/login', component: LoginLayout, children: [{ path: '', component: LoginPage }] }
```

### 5. Использовать authStore

```js
import { useAuthStore } from 'jetgoods-sso-ui'
const authStore = useAuthStore()
```

### 6. CookieConsent

```vue
<template>
  <router-view />
  <CookieConsent />
</template>

<script setup>
import { CookieConsent } from 'jetgoods-sso-ui'
</script>
```

## Зависимости

- `pinia` — для хранения состояния
- `axios` — HTTP-клиент
- `vue-router` — навигационный гард
- `quasar` (Notify, Cookies) — уведомления и cookies

## Разработка

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
```