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
    samples: {
      type: Array,
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
      this.timeline = updateTimeline(this.samples, newDate);
    }
  },
  mounted(){
    this.timeline = updateTimeline(this.samples, this.currentDate);
  }
};
</script>
