import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import shell, { ipcRenderer } from 'electron'
import { handleExternalRoutes } from './controllers/externalRoutes'
import Vue3Toasity from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)
    .use(Vue3Toasity)
    .mount('#app')

document.addEventListener('keydown', function (e) {
    if (e.which === 123) {
        shell.remote.getCurrentWindow().webContents.toggleDevTools()
    } else if (e.which === 116) {
        location.reload()
    }
})

ipcRenderer.on('data', async function (evt, message) {
    if (message.externalRoute) {
        await handleExternalRoutes(app, message.externalRoute)
    }
})
