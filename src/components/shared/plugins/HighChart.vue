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
    currentDate() {
      return this.$store.state.currentDate;
    },
    experiment() {
      return this.$store.getters.oneExperimentSelector(this.plugin.experiment);
    },
    samples() {
      return this.$store.getters.samplesSelector(this.plugin.measures);
    },
    alarms() {
      return this.$store.getters.oneAlarmsSelector(this.plugin.experiment);
    },
    modifications() {
      return this.$store.getters.modificationsSelector(this.plugin.measures);
    }
  },
  watch: {
    currentDate(currentDate) {
      if (!this.service) {
        return;
      }
      this.service.setTime(currentDate, this.$store.state.speed);
    },
    samples() {
      this.updateSamples();
    },
    alarms() {
      this.updateAlarms();
    },
    modifications(newModifications) {
      this.updateModifications(newModifications);
    }
  },
  mounted() {
    this.service = createChart(this.$refs.chart, this.experiment, this.currentDate);
    this.service.addOnClickObserver(date => {
      this.$store.commit('SET_CURRENT_DATE', date);
      this.$store.commit('SET_SPEED', 300);
    });
    this.updateSamples();
    this.updateAlarms();
    this.updateModifications(this.modifications);
    this.$nextTick(() => this.onUpdate());
  },
  destroyed() {
    this.service && this.service.destroy();
  },
  methods: {
    updateSamples() {
      if (!this.service) {
        return;
      }
      this.service.cleanMeasures();
      for (const { measure, samples } of this.samples) {
        this.service.addMeasure(measure, samples);
      }
    },
    updateAlarms() {
      if (!this.service) {
        return;
      }
      this.service.cleanAlarms();
      for (const alarm of this.alarms) {
        this.service.addAlarm(alarm);
      }
    },
    updateModifications(modifications) {
      if (!this.service) {
        return;
      }
      this.service.cleanModifications();
      for (const modification of modifications) {
        this.service.addModification(modification);
      }
    },
    onUpdate() {
      this.service && this.service.scale();
    }
  }
};
</script>
