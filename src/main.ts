import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(App)



const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) 


app.use(pinia)
app.use(router)
app.use(VueVirtualScroller)

app.mount('#app')
