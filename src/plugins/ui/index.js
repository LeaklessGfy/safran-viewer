import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Notifications from 'vue-notification';
import Cleave from 'vue-cleave-component';
import Icon from 'vue-awesome/components/Icon';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-awesome/icons';

import './highchart';

import 'nouislider';
import 'nouislider/distribute/nouislider.css';

Vue.use(BootstrapVue);
Vue.use(Notifications);
Vue.use(Cleave);
Vue.component('v-icon', Icon);
