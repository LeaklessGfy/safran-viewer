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
import updateTimeline from '@/services/plugins/timeline';

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
    samples() {
      return this.$store.getters.samplesSelector(this.plugin.measures);
    },
    currentDate() {
      return this.$store.state.currentDate;
    }
  },
  watch: {
    samples() {
      this.timeline = updateTimeline(this.samples, this.currentDate);
    },
    currentDate() {
      this.timeline = updateTimeline(this.samples, this.currentDate);
    }
  },
  mounted() {
    this.timeline = updateTimeline(this.samples, this.currentDate);
  }
};
</script>
