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
      service: null
    };
  },
  mounted() {
    this.createService();
  },
  methods: {
    async createService() {
      this.service = new ChartService(
        this.$refs.chart,
        this.plugin.experiment.startDate,
        this.plugin.experiment.startDate,
        this.plugin.experiment.endDate
      );
      this.service.addOnReadyListener(async () => {
        for (let measure of this.plugin.selectedMeasures) {
          const samples = await this.$db.fetchSamples(measure.id);
          this.service.addMeasure(measure, samples);
        }
      });
    }
  }
};
</script>
