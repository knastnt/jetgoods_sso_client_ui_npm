import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

// Пакеты, которые НЕ должны попадать в бандл: их предоставляет приложение
// (peerDependencies) либо они ставятся как обычные зависимости (axios).
const externalPkgs = ['vue', 'pinia', 'vue-router', 'quasar', 'axios']

// Учитываем и подпути: 'vue/jsx-runtime', 'quasar/src/...', 'pinia/dist/...' и т.п.
const isExternal = (id) =>
    externalPkgs.some((pkg) => id === pkg || id.startsWith(`${pkg}/`))

export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
            name: 'JetgoodsSsoUi',
            formats: ['es', 'cjs'],
            fileName: (format) => `jetgoods-sso-ui.${format === 'es' ? 'js' : 'cjs'}`
        },
        rollupOptions: {
            external: isExternal,
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