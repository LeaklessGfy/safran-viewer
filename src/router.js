import VueRouter from 'vue-router';
import Home from './components/home/Home';
import Experiment from './components/experiment/Experiment';
import Protocol from './components/protocol/Protocol';
import Import from './components/import/Import';
import Config from './components/config/Config';

const routes = [
  { path: '/', component: Home },
  { path: '/experiment/:id', component: Experiment },
  { path: '/protocol', component: Protocol },
  { path: '/import', component: Import },
  { path: '/config', component: Config }
];

const router = new VueRouter({ routes });

export default router;
