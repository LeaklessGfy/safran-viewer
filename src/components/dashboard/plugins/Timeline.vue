<template>
  <b-table
    striped
    hover
    :items="timeline"
  />
</template>

<script>
export default {
  data() {
    return {
      timeline: []
    };
  }
};
</script>
