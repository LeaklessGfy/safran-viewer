<template>
  <div
    ref="chart"
    class="w-100 h-100"
  />
</template>

<script>
import ChartService from '@/services/chart';

export default {
  props: {
    plugin: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      service: null,
      formerMeasures: []
    };
  },
  mounted() {
    if (this.plugin.experiment === null) {
      return;
    }
    if (this.service === null) {
      this.createService();
    } else {
      this.updateService();
    }
  },
  methods: {
    async createService() {
      this.service = new ChartService(
        this.$refs.chart,
        this.plugin.experiment.startDate,
        this.plugin.experiment.startDate,
        this.plugin.experiment.endDate
      );
      this.service.addOnReadyListener(() => Promise.resolve());
    },
    async updateService() {
      this.service.rescale(
        this.plugin.experiment.startDate,
        this.plugin.experiment.startDate,
        this.plugin.experiment.endDate
      );
      
      for (let measure of this.plugin.selectedMeasures) {
        if (this.formerMeasures.some(m => m.id === measure.id)) {
          continue;
        }
        const samples = await this.$db.fetchSamples(measure.id);
        this.service.addMeasure(measure, samples);
      }
      
      for (let measure of this.plugin.removedMeasures) {
        this.service.removeMeasure(measure);
      }
    }
  }
};
</script>
