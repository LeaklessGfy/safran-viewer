<template>
  <div>
    <chart-menu
      v-if="service"
      :mod="mod"
      :experiment="experiment"
      :service="service"
    />
    
    <div
      :ref="mod"
      class="chart"
    />

    <chart-tabs
      v-if="service"
      :mod="mod"
      :experiment="experiment"
      :service="service"
    />
  </div>
</template>

<script>
import ChartService, { ChartContext } from '@/services/chart';
import Menu from './chart/Menu';
import Tabs from './chart/Tabs';

export default {
  components: {
    'chart-menu': Menu,
    'chart-tabs': Tabs
  },
  props: {
    mod: {
      type: String,
      required: false,
      default: 'default'
    }
  },
  data() {
    return {
      service: null,
      sub: null,
    };
  },
  subscriptions() {
    return {
      experiment: this.$db.getExperiment(),
      measures: this.$db.getMeasures()
    };
  },
  mounted() {
    this.service = new ChartService(this.$refs[this.mod], this.experiment.beginTime, this.experiment.endTime);
    ChartContext[this.mod] = this.service;

    this.$db.fetchAlarms(this.experiment.id)
    .then(alarms => {
      this.service.addAlarms(alarms);
    });

    this.sub = this.$db.getExperiment().subscribe(experiment => {
      this.service.rescale(experiment.beginTime, experiment.endTime);
    });
  },
  beforeDestroy() {
    this.service.destroy();
    delete ChartContext[this.mod];
    this.sub.unsubscribe();
  }
};
</script>

<style>
.chart {
  width: 100%;
  height: 500px;
}
</style>
