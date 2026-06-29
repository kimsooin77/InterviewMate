import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/app/styles/global.scss';
import App from '@/app/App.vue';
import pinia from '@/app/plugins/pinia';
import router from '@/app/router';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount('#app');
