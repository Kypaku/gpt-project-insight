import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import shell from 'electron'

createApp(App).mount('#app')

document.addEventListener('keydown', function (e) {
    if (e.which === 123) {
        shell.remote.getCurrentWindow().webContents.toggleDevTools()
    } else if (e.which === 116) {
        location.reload()
    }
})
