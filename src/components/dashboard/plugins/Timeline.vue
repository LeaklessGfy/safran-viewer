<template>
  <b-table
    striped
    dark
    hover
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
    }
  },
  watch: {
    currentDate(newDate) {
      this.updateTimeline(newDate);
    }  
  },
  methods: {
    async updateTimeline(date) {
      const timeline = [];
      for (let measure of this.plugin.measures) {
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
