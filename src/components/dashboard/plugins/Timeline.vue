<template>
  <b-table
    striped
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
    currentTime() {
      return this.$store.state.currentTime;
    }
  },
  mounted() {
    this.timeline = this.plugin.selectedMeasures.map(measure => {
      const data = 1;
      
      return {
        measure: measure.name,
        type: measure.type,
        unit: measure.unit,
        value: data ? data.valueY : '-'
      };
    });
  }
};
</script>
