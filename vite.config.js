import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'JetgoodsSsoUi',
      formats: ['es', 'cjs'],
      fileName: (format) => `jetgoods-sso-ui.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue', 'pinia', 'vue-router', 'axios', 'quasar'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
          'vue-router': 'VueRouter',
          axios: 'Axios',
          quasar: 'Quasar'
        }
      }
    }
  }
})