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
    experiment: {
      type: Object,
      required: true
    },
    samples: {
      type: Array,
      required: false,
      default: () => []
    },
    alarms: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      service: null
    };
  },
  async mounted() {
    this.service = createChart(this.$refs.chart, this.experiment);
    this.service.addOnClickObserver(date => this.$store.commit('SET_CURRENT_DATE', date));
    for (const { measure, samples } of this.samples) {
      this.service.addMeasure(measure, samples);
    }
    for (const alarm of this.alarms) {
      this.service.addAlarm(alarm);
    }
    this.$nextTick(() => {
      if (this.service) {
        this.service.reflow();
      }
    });
  }
};
</script>
