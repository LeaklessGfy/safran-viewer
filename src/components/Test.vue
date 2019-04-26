<template>
  <b-button variant="primary" @click="sendTest" />
</template>

<script>
export default {
  mounted() {
    const source = new EventSource('http://localhost:8888/events');
    source.onmessage = function(event) {
      console.log(event);
    };
  },
  methods: {
    sendTest() {
      fetch('http://localhost:8888/simple');
    }
  }
};
</script>
