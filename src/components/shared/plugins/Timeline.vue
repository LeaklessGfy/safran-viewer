<template>
  <b-table
    striped
    dark
    hover
    class="m-0"
    :items="timeline"
  />
</template>

<script>
export default {
  props: {
    plugin: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      timeline: []
    };
  },
  computed: {
    currentDate() {
      return this.$store.state.currentDate;
    },
    measures() {
      return this.$store.getters.measuresSelector(this.plugin.measures);
    },
    samples() {
      return this.$store.getters.samplesSelector(this.plugin.samples);
    }
  },
  watch: {
    currentDate(newDate) {
      this.updateTimeline(newDate);
    }  
  },
  async mounted() {
    await this.$store.dispatch('fetchExperiment', this.plugin.experiment);
    await this.$store.dispatch('fetchMeasures', this.plugin.measures);
    await this.$store.dispatch('fetchSamples', this.plugin.measures);

    this.updateTimeline(Date.now());
  },
  methods: {
    async updateTimeline(date) {
      const timeline = [];
      for (let measure of this.measures) {
        const data = '-'; // find good value in sample
        timeline.push({
          measure: measure.name,
          type: measure.type,
          unit: measure.unit,
          value: data ? data : '-'
        });
      }
      this.timeline = timeline;
    }
  }
};
</script>
