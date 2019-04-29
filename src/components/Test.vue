<template>
  <b-button
    variant="primary"
    @click="sendTest"
  >
    Send
  </b-button>
</template>

<script>
export default {
  mounted() {
    const source = new EventSource('http://localhost:8888/events');
    source.onopen	= function(event) {
      console.log('open', event);
    };
    source.onmessage = function(event) {
      console.log('message', event);
    };
    source.onerror = function(event) {
      console.log('error', event);
    };
  },
  methods: {
    sendTest() {
      fetch('http://localhost:8888/simple');
    }
  }
};
</script>
