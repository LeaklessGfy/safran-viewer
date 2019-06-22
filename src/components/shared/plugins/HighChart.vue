<template>
  <div
    ref="chart"
    class="chart w-100 h-100"
  />
</template>

<script>
import { createChart } from '@/services/plugins/highchart';

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
  computed: {
    currentDate() {
      return this.$store.state.currentDate;
    },
    modifications() {
      return this.$store.state.modifications;
    }
  },
  watch: {
    currentDate(currentDate) {
      if (this.service) {
        this.service.setTime(currentDate);
      }
    },
    samples() {
      if (this.service) {
        this.init();
      }
    }
  },
  mounted() {
    this.init();
    this.$nextTick(() => this.onUpdate());
  },
  destroyed() {
    if (this.service) {
      this.service.destroy();
    }
  },
  methods: {
    init() {
      if (this.service) {
        this.service.destroy();
      }
      this.service = createChart(this.$refs.chart, this.experiment);
      this.service.addOnClickObserver(date => this.$store.commit('SET_CURRENT_DATE', date));
      for (const { measure, samples } of this.samples) {
        this.service.addMeasure(measure, samples);
      }
      for (const alarm of this.alarms) {
        this.service.addAlarm(alarm);
      }
      for (const modification of Object.values(this.modifications)) {
        this.service.addModification(modification);
      }
    },
    onUpdate() {
      if (this.service) {
        this.service.scale();
      }
    }
  }
};
</script>
