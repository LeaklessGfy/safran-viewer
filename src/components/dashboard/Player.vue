<template>
  <b-button-group class="mt-2">
    <b-button
      variant="warning"
      :disabled="state !== 1"
      @click="pauseTimeline"
    >
      <v-icon name="pause" />
    </b-button>
    <b-button
      variant="primary"
      :disabled="state === 1"
      @click="startTimeline"
    >
      <v-icon name="play" />
    </b-button>
    <b-button
      variant="danger"
      :disabled="state === 0"
      @click="stopTimeline"
    >
      <v-icon name="stop" />
    </b-button>
  </b-button-group>
</template>

<script>
import { addMilliseconds } from 'date-fns';

export default {
  props: {
    speed: {
      type: Number,
      required: false,
      default: () => 100
    }
  },
  data() {
    return {
      state: 0,
      interval: null
    };
  },
  computed: {
    currentDate() {
      return this.$store.state.currentDate;
    }
  },
  methods: {
    startTimeline() {
      this.state = 1;
      this.interval = setInterval(() => {
        const newDate = addMilliseconds(this.currentDate, this.speed);
        this.$store.commit('SET_CURRENT_DATE', newDate);
      }, this.speed);
    },
    pauseTimeline() {
      this.state = 2;
      clearInterval(this.interval);
    },
    stopTimeline() {
      this.state = 0;
      clearInterval(this.interval);
    },
  }
};
</script>

