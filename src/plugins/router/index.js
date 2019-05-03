import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/components/home/Home';
import Experiment from '@/components/experiment/Experiment';
import Protocol from '@/components/protocol/Protocol';
import Import from '@/components/import/Import';
import Config from '@/components/config/Config';

Vue.use(VueRouter);

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/experiment/:id', name: 'experiment', component: Experiment },
  { path: '/protocol', name: 'protocol', component: Protocol },
  { path: '/import', name: 'import', component: Import },
  { path: '/config', name: 'config', component: Config }
];

export const router = new VueRouter({ routes });
