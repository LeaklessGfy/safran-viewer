<template>
  <div>
    <chart-menu
      v-if="service"
      :mod="mod"
      :experiment="experiment"
    />
    
    <div
      :ref="mod"
      class="chart"
    />

    <chart-tabs
      v-if="service"
      :mod="mod"
      :experiment="experiment"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ChartService from '@/services/chart';
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
      default: "default"
    }
  },
  data() {
    return {
      sub: null,
    }
  },
  subscriptions() {
    return {
      experiment: this.$db.getExperiment(),
      measures: this.$db.getMeasures()
    }
  },
  computed: mapState({
    service(state) {
      return state[this.mod].service;
    }
  }),
  mounted() {
    const service = new ChartService(this.$refs[this.refName], this.experiment.beginTime, this.experiment.endTime);

    this.$db.fetchAlarms(this.experiment.id)
    .then(alarms => {
      service.addAlarms(alarms);
    });

    this.sub = this.$db.getExperiment().subscribe(experiment => {
      service.rescale(experiment.beginTime, experiment.endTime);
    });

    this.$store.commit(`${this.mod}/SET_SERVICE`, service);
  },
  beforeDestroy() {
    this.service.destroy();
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
