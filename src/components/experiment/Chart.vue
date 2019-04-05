<template>
  <div>
    <chart-menu
      v-if="chart"
      :chart="chart"
      :experiment="experiment"
      :onOkMeasure="onOkMeasure"
    />
    
    <div class="chart" :ref="refName"/>

    <chart-tabs
      v-if="chart"
      :chart="chart"
      :experiment="experiment"
      :measuresId="Object.values(selectedMeasures).map(m => m.id)"
      :timelineValues="timelineValues"
    />
  </div>
</template>

<script>
import ChartService from '../../services/chart';
import { dateToTime } from '../../services/date';
import Menu from './chart/Menu';
import Tabs from './chart/Tabs';

export default {
  props: {
    refName: String
  },
  data() {
    return {
      /* CHART */
      chart: null,
      sub: null,
      /* MEASURE */
      selectedMeasures: {},
      timelineValues: []
    }
  },
  subscriptions() {
    return {
      experiment: this.$db.getExperiment(),
      measures: this.$db.getMeasures()
    }
  },
  mounted() {
    this.chart = new ChartService(this.$refs[this.refName], this.experiment.beginTime, this.experiment.endTime, {
      onSelect: (startDate, endDate) => {
        this.modification.startTime = dateToTime(startDate);
        this.modification.endTime = dateToTime(endDate);
      }
    });

    this.chart.addOnDateListener(date => {
      this.updateTimelineValues(date);
    });

    this.$db.fetchAlarms(this.experiment.id)
    .then(alarms => {
      this.chart.addAlarms(alarms);
    });

    this.sub = this.$db.getExperiment().subscribe(experiment => {
      this.chart.rescale(experiment.beginTime, experiment.endTime);
    });
  },
  beforeDestroy() {
    this.chart.destroy();
    this.sub.unsubscribe();
  },
  methods: {
    async onOkMeasure(tmpMeasures) {
      const former = Object.assign({}, this.selectedMeasures);
      this.selectedMeasures = {};
      for (let measure of tmpMeasures) {
        if (!former[measure.id]) {
          this.selectedMeasures[measure.id] = measure;
          const samples = await this.$db.fetchSamples(measure.id);
          this.chart.addMeasure(measure, samples);
        } else {
          this.selectedMeasures[measure.id] = former[measure.id];
          delete former[measure.id];
        }
      }
      for (let remove of Object.values(former)) {
        this.chart.removeMeasure(remove);
      }
    },
    updateTimelineValues(date) {
      this.timelineValues = Object.values(this.selectedMeasures).map(measure => {
        const data = this.chart.getMeasureData(measure, date);
        return {
          measure: measure.name,
          type: measure.type,
          unit: measure.unit,
          value: data ? data.valueY : '-'
        };
      });
    }
  },
  components: {
    'chart-menu': Menu,
    'chart-tabs': Tabs
  }
};
</script>

<style>
.chart {
  width: 100%;
  height: 500px;
}
</style>
