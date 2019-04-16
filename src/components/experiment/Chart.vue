<template>
  <div>
    <chart-menu
      v-if="chart"
      :ref-id="refId"
      :experiment="experiment"
    />
    
    <div
      :ref="refName"
      class="chart"
    />

    <chart-tabs
      v-if="chart"
      :ref-id="refId"
      :experiment="experiment"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ChartService from '../../services/chart';
import Menu from './chart/Menu';
import Tabs from './chart/Tabs';

export default {
  components: {
    'chart-menu': Menu,
    'chart-tabs': Tabs
  },
  props: {
    refName: {
      type: String,
      required: true
    },
    refId: {
      type: Number,
      required: true
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
    chart(state) {
      return state.charts[this.refId].chart;
    }
  }),
  mounted() {
    const chart = new ChartService(this.$refs[this.refName], this.experiment.beginTime, this.experiment.endTime);

    this.$db.fetchAlarms(this.experiment.id)
    .then(alarms => {
      chart.addAlarms(alarms);
    });

    this.sub = this.$db.getExperiment().subscribe(experiment => {
      chart.rescale(experiment.beginTime, experiment.endTime);
    });

    this.$store.commit('updateChart', { refId: this.refId, chart });
  },
  beforeDestroy() {
    this.chart.destroy();
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
