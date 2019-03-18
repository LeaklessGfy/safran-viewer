import Vue from 'vue';
import VueRouter from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import VueRx from 'vue-rx';
import Icon from 'vue-awesome/components/Icon';
import router from './router';
import App from './App.vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-awesome/icons';

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(BootstrapVue);
Vue.use(VueRx);
Vue.component('v-icon', Icon);

new Vue({
  render: h => h(App),
  router
}).$mount('#app');
