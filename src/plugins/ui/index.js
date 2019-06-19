import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Notifications from 'vue-notification';
import Cleave from 'vue-cleave-component';
import Icon from 'vue-awesome/components/Icon';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-awesome/icons';

Vue.use(BootstrapVue);
Vue.use(Notifications);
Vue.use(Cleave);
Vue.component('v-icon', Icon);

import * as Highcharts from 'highcharts';

Highcharts.theme = {
  colors: ['#F92672', '#66D9EF', '#A6E22E', '#A6E22E'],
  chart: {
    backgroundColor: '#2D3035',
    style: {
      color: '#A2A39C'
    }
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    style: {
      color: '#F0F0F0'
    }
  },
  title: {
    style: {
      color: '#F0F0F0'
    },
    align: 'center'
  },
  subtitle: {
    style: {
      color: '#A2A39C'
    },
    align: 'center'
  },
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    itemStyle: {
      fontWeight: 'normal',
      color: '#A2A39C'
    },
    itemHoverStyle: {
      color: '#F0F0F0'
    }
  },
  xAxis: {
    gridLineDashStyle: 'ShortDot',
    gridLineWidth: 1,
    gridLineColor: '#A2A39C',
    lineColor: '#A2A39C',
    minorGridLineColor: '#A2A39C',
    tickColor: '#A2A39C',
    tickWidth: 1
  },
  yAxis: {
    gridLineDashStyle: 'ShortDot',
    gridLineWidth: 1,
    gridLineColor: '#A2A39C',
    lineColor: '#A2A39C',
    minorGridLineColor: '#A2A39C',
    tickColor: '#A2A39C',
    tickWidth: 1
  },
  plotOptions: {
    areaspline: {
      fillColor: {
        linearGradient: {
          x1: 0,
          y1: 1,
          x2: 0,
          y2: 0
        },
        stops: [
          [0, Highcharts.getOptions().colors[0]],
          [
            1,
            Highcharts.Color(Highcharts.getOptions().colors[1])
              .setOpacity(0.1)
              .get('rgba')
          ]
        ]
      },
      lineWidth: 2,
      states: {
        hover: {
          lineWidth: 3
        }
      },
      threshold: null
    }
  }
};

Highcharts.setOptions(Highcharts.theme);
