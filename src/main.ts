import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, _instance, info) => {
  console.error('[app] 未捕获的组件错误:', info, err)
}

app.mount('#app')
