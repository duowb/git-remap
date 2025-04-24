import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';

import App from './App.vue';

import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark'
    }
  }
});
app.use(ToastService);
app.mount('#app');
