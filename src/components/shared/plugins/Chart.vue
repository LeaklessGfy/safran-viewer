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
    }
  },
  async mounted() {
    await this.$store.dispatch('fetchExperimentSelector', this.plugin.experiment);
    await this.$store.dispatch('fetchMeasuresSelector', this.plugin.measures);
    if (this.experiment) {
      this.createService();
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
      this.service.addOnReadyListener(async () => {
        for (let measure of this.measures) {
          const samples = await this.$db.fetchSamples(measure.id);
          this.service.addMeasure(measure, samples);
        }
      });
      this.service.addOnDateListener(date => {
        this.$store.commit('SET_CURRENT_DATE', date);
      });
    }
  }
};
</script>
