import './assets/styles.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.mount('#app')
