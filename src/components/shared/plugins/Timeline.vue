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
    }
  },
  watch: {
    currentDate(newDate) {
      this.updateTimeline(newDate);
    }  
  },
  async mounted() {
    await this.$store.dispatch('fetchExperimentSelector', this.plugin.experiment);
    await this.$store.dispatch('fetchMeasuresSelector', this.plugin.measures);

    this.updateTimeline(Date.now());
  },
  methods: {
    async updateTimeline(date) {
      const timeline = [];
      for (let measure of this.measures) {
        const data = await this.$db.fetchSample(measure, date);
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
