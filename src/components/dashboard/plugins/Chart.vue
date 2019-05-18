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
    experiment: {
      type: Object,
      required: true
    },
    selectedMeasures: {
      type: Array,
      required: true
    },
    removedMeasures: {
      type: Array,
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
        this.experiment.startDate,
        this.experiment.startDate,
        this.experiment.endDate
      );
      this.service.addOnReadyListener(() => Promise.resolve());
    },
    async updateService() {
      this.service.rescale(this.experiment.startDate, this.experiment.startDate, this.experiment.endDate);
      
      for (let measure of this.selectedMeasures) {
        if (this.formerMeasures.some(m => m.id === measure.id)) {
          continue;
        }
        const samples = await this.$db.fetchSamples(measure.id);
        this.service.addMeasure(measure, samples);
      }
      
      for (let measure of this.removedMeasures) {
        this.service.removeMeasure(measure);
      }
    }
  }
};
</script>
