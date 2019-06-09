import Vue from 'vue';
import App from './App.vue';
import { router, store } from './plugins';

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app');
