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
import { mapState } from 'vuex';
import { timeToTimestamp } from '@/services/date';

export default {
  props: {
    mod: {
      type: String,
      required: true
    },
    experiment: {
      type: Object,
      required: true
    },
    service: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      state: 0,
      interval: null
    };
  },
  computed: {
    ...mapState({
      currentTime(state) {
        return state[this.mod].currentTime;
      }
    })
  },
  methods: {
    startTimeline() {
      this.state = 1;
      const speed = 100;
      const currentDate = timeToTimestamp(this.currentTime, this.experiment.beginTime);
      this.service.startTimeline(currentDate);

      this.interval = setInterval(() => {
        const newDate = this.chart.tickTimeline(speed);
        if (newDate.getTime() >= this.experiment.endTime) {
          clearInterval(this.interval);
          this.service.stopTimeline();
        }
      }, speed);
    },
    pauseTimeline() {
      this.state = 2;
      clearInterval(this.interval);
      this.service.pauseTimeline();
    },
    stopTimeline() {
      this.state = 0;
      clearInterval(this.interval);
      this.service.stopTimeline();
    },
  }
};
</script>

