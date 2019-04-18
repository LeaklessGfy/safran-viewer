<template>
  <div>
    <chart-menu
      v-if="service"
      :mod="mod"
      :service="service"
    />
    
    <div
      :ref="mod"
      class="chart"
    />

    <chart-tabs
      v-if="service"
      :mod="mod"
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
      service: null
    };
  },
  subscriptions() {
    return {
      measures: this.$db.getMeasures()
    };
  },
  computed: {
    experiment() {
      return this.$store.state[this.mod].experiment;
    }
  },
  mounted() {
    this.service = new ChartService(this.$refs[this.mod], this.experiment.beginTime, this.experiment.endTime);
    ChartContext[this.mod] = this.service;

    this.$db.fetchAlarms(this.experiment.id)
    .then(alarms => {
      this.service.addAlarms(alarms);
    });
  },
  beforeDestroy() {
    this.service.destroy();
    delete ChartContext[this.mod];
  }
};
</script>

<style>
.chart {
  width: 100%;
  height: 500px;
}
</style>
