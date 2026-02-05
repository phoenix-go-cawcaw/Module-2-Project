import { createApp, reactive } from 'vue'
import App from './App.vue'
import router from './router'

const globalState = reactive({
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true'
})

const app = createApp(App)
app.provide('globalState', globalState)
app.use(router)
app.mount('#app')