<template>
  <div
    ref="chart"
    class="chart w-100 h-100"
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
  computed: {
    experiment() {
      return this.$store.getters.experimentSelector(this.plugin.experiment);
    },
    measures() {
      return this.$store.getters.measuresSelector(this.plugin.measures);
    },
    samples() {
      return this.$store.getters.samplesSelector(this.plugin.measures);
    }
  },
  watch: {
    samples(newSamples) {
      console.log(newSamples);
    }
  },
  async mounted() {
    await this.$store.dispatch('fetchExperimentSelector', this.plugin.experiment);
    if (this.experiment) {
      this.createService();
    }

    this.$store.dispatch('fetchMeasuresSelector', this.plugin.measures);
    this.$store.dispatch('fetchSamplesSelector', this.plugin.measures);
  },
  methods: {
    async createService() {
      this.service = new ChartService(
        this.$refs.chart,
        this.experiment.startDate,
        this.experiment.startDate,
        this.experiment.endDate
      );
      this.service.addOnDateListener(date => {
        this.$store.commit('SET_CURRENT_DATE', date);
      });
    }
  }
};
</script>
