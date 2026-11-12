<template>
  <transition name="slide-up">
    <div v-if="showBanner" class="cookie-consent-banner">
      <div class="cookie-consent-container">
        <div class="cookie-consent-content">
          <div class="cookie-icon">
            <q-icon name="cookie" size="32px" color="white" />
          </div>
          <div class="cookie-text">
            <p class="cookie-description">
              Этот сайт использует файлы cookie для обеспечения корректной работы сервиса,
              аналитики и улучшения пользовательского опыта. Продолжая использовать сайт,
              вы соглашаетесь с использованием файлов cookie, а также с
              <a :href="privacyPolicyUrl" target="_blank" rel="noopener noreferrer" class="cookie-link">Политикой конфиденциальности</a>
              и
              <a :href="personalDataPolicyUrl" target="_blank" rel="noopener noreferrer" class="cookie-link">Политикой обработки персональных данных</a>
              в соответствии с Федеральным законом №152-ФЗ.
            </p>
          </div>
        </div>
        <div class="cookie-actions">
          <q-btn
            label="Хорошо"
            color="primary"
            unelevated
            @click="acceptCookies"
            class="cookie-btn cookie-btn-accept"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/**
 * ⚠️ Настройте эти переменные под свой проект
 */
const COOKIE_CONSENT_KEY = 'jetgoods_cookie_consent'
const privacyPolicyUrl = 'https://sso.jetgoods.ru/privacy-policy'
const personalDataPolicyUrl = 'https://sso.jetgoods.ru/personal-data-policy'

const showBanner = ref(false)

const checkConsent = () => {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!consent) {
    setTimeout(() => {
      showBanner.value = true
    }, 1000)
  } else {
    const consentData = JSON.parse(consent)
    if (consentData.accepted) {
      enableCookies()
    }
  }
}

const acceptCookies = () => {
  saveConsent(true)
  enableCookies()
}

const rejectCookies = () => {
  saveConsent(false)
  showBanner.value = false
}

const saveConsent = (accepted) => {
  const consentData = {
    accepted,
    timestamp: new Date().toISOString(),
    version: '1.0',
  }
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData))
  showBanner.value = false
}

const enableCookies = () => {
  console.log('Cookies enabled')
}

onMounted(() => {
  checkConsent()
})
</script>

<style scoped lang="scss">
.cookie-consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  animation: slideUp 0.4s ease-out;
}

.cookie-consent-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.cookie-consent-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 300px;
}

.cookie-icon { flex-shrink: 0; padding: 8px; }
.cookie-text { color: white; }
.cookie-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
}

.cookie-link {
  color: white;
  text-decoration: underline;
  font-weight: 500;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; }
}

.cookie-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.cookie-btn { white-space: nowrap; font-weight: 500; padding: 8px 24px; }

.cookie-btn-accept {
  background: white !important;
  color: #667eea !important;
  &:hover { background: rgba(255, 255, 255, 0.95) !important; }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s ease-out, opacity 0.4s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 768px) {
  .cookie-consent-banner { padding: 16px; }
  .cookie-consent-container { flex-direction: column; align-items: stretch; }
  .cookie-consent-content { min-width: auto; }
  .cookie-actions { flex-direction: row; width: 100%;
    .cookie-btn { flex: 1; }
  }
}

@media (max-width: 480px) {
  .cookie-icon { display: none; }
  .cookie-actions { flex-direction: column;
    .cookie-btn { width: 100%; }
  }
}
</style>