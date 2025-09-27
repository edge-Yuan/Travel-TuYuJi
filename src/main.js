import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router'
import './assets/css/global.css';
import { createPinia } from 'pinia';

const pinia = createPinia();
Vue.use(ElementUI,pinia);
Vue.prototype.$bus = new Vue()


new Vue({
  el: '#app',
  router,
  render: h => h(App)
});