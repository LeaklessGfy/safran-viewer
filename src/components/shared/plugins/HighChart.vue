<template>
  <div
    ref="chart"
    class="chart w-100 h-100"
  />
</template>

<script>
import { createChart } from '@/services/highchart';

export default {
  name: 'HighChart',
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
  computed: {
    experiment() {
      return this.$store.getters.experimentSelector(this.plugin.experiment);
    },
    samples() {
      return this.$store.getters.fullSamplesSelector(this.plugin.measures);
    }
  },
  async mounted() {
    await this.$store.dispatch('fetchExperiment', this.plugin.experiment);
    await this.$store.dispatch('fetchFullSamples', this.plugin.measures);
    this.service = createChart(this.$refs.chart, this.experiment);
    
    for (const { measure, samples } of this.samples) {
      const series = samples.map(sample => [sample.time.getTime(), parseFloat(sample.value)]);
      this.service.addSeries(measure, series);
    }
  }
};
</script>
