<template>
  <q-page class="login-page">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- Login Content -->
    <div class="login-container">
      <div class="login-content">
        <!-- Logo and Branding -->
        <div class="login-header">
          <div class="login-logo">🔐</div>
          <h1 class="login-title">{{ appName }}</h1>
          <p class="login-subtitle">{{ appDescription }}</p>
        </div>

        <!-- Login Card -->
        <div class="login-card glass-effect">
          <div v-if="!authStore.isAuthenticated">
            <div class="card-header">
              <h2 class="card-title">Вход в систему</h2>
              <p class="card-text">Войдите через SSO для доступа к сервису</p>
            </div>

            <div class="login-actions">
              <q-btn
                color="white"
                text-color="primary"
                size="lg"
                label="Войти через sso.jetgoods.ru"
                icon="login"
                @click="handleLogin"
                :loading="loading"
                unelevated
                class="login-button"
              />
            </div>

            <div v-if="error" class="error-message">
              <q-icon name="error_outline" size="20px" />
              <span>{{ error }}</span>
            </div>
          </div>

          <div v-else class="user-section">
            <div class="user-avatar-wrapper">
              <div class="user-avatar">
                <div class="avatar-initials">{{ getUserInitials(authStore.user?.name) }}</div>
                <div class="avatar-glow"></div>
              </div>
            </div>

            <div class="user-info">
              <h3 class="user-name">Добро пожаловать{{ authStore.user?.name ? ', ' + authStore.user.name : '' }}!</h3>
              <p class="user-email">{{ authStore.user?.email }}</p>
            </div>

            <div class="user-actions">
              <q-btn
                color="white"
                text-color="primary"
                size="lg"
                label="Перейти в приложение"
                icon="arrow_forward"
                :to="afterLoginRoute"
                unelevated
                class="action-button primary-action"
              />
              <q-btn
                flat
                text-color="white"
                size="md"
                label="Выйти"
                icon="logout"
                @click="handleLogout"
                class="action-button secondary-action"
              />
            </div>
          </div>
        </div>

        <!-- Footer Link -->
        <div class="login-footer">
          <a href="https://jetgoods.ru" class="footer-link" target="_blank">
            <q-icon name="language" size="18px" />
            <span>JETGOODS.RU</span>
          </a>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref(null);

/**
 * ⚠️ Настройте эти переменные под свой проект
 */
const appName = 'SSO Application'
const appDescription = 'Защищённый доступ через единую систему аутентификации'
const afterLoginRoute = '/'

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  try {
    await authStore.login();
  } catch (err) {
    error.value = 'Ошибка при входе. Попробуйте еще раз.';
    loading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (err) {
    console.error('Logout error:', err);
  }
};

const getUserInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('code') || urlParams.has('error')) {
    const result = await authStore.handleCallbackParams(urlParams);

    if (result.success) {
      console.log('Authentication successful, redirecting to:', result.targetUrl);
      router.push(result.targetUrl);
    } else if (urlParams.has('error')) {
      error.value = 'Ошибка аутентификации: ' + urlParams.get('error');
    }
  } else {
    loading.value = true;
    await authStore.initAuth();
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.login-page {
  background: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;

  &.shape-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    top: -100px;
    left: -100px;
    animation-delay: 0s;
  }

  &.shape-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    top: 50%;
    right: -100px;
    animation-delay: 7s;
  }

  &.shape-3 {
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    bottom: -200px;
    left: 30%;
    animation-delay: 14s;
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 20px;
}

.login-content {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  text-align: center;
  margin-bottom: 3rem;
}

.login-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
  box-shadow: 0 15px 50px rgba(102, 126, 234, 0.5);
  animation: float-gentle 6s infinite ease-in-out;
}

@keyframes float-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;

  @media (max-width: 480px) { font-size: 1.6rem; }
}

.login-subtitle {
  font-size: 1rem;
  opacity: 0.7;
  margin: 0;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.login-card {
  padding: 3rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  }

  @media (max-width: 480px) { padding: 2rem; }
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #ffffff;

  @media (max-width: 480px) { font-size: 1.5rem; }
}

.card-text {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}

.login-actions {
  margin-top: 2rem;
}

.login-button {
  width: 100%;
  padding: 14px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  margin-top: 1.5rem;
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  color: #ff6b6b;
  font-size: 0.95rem;
  animation: shake 0.5s ease-in-out;

  .q-icon { flex-shrink: 0; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.user-section { text-align: center; }

.user-avatar-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  position: relative;
  z-index: 2;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.5);
}

.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
  filter: blur(20px);
  z-index: 1;
  animation: pulse-glow 2s infinite ease-in-out;
}

@keyframes pulse-glow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
}

.user-info { margin-bottom: 2rem; }

.user-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-email { font-size: 1rem; opacity: 0.7; margin: 0; }

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-button {
  width: 100%;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;

  &.primary-action {
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    &:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6); }
  }

  &.secondary-action {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    &:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-2px); }
  }
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
  }
}
</style>