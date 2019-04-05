<template>
  <b-button-group class="mt-2">
    <b-button variant="warning" :disabled="state !== 1" @click="() => onClickTimeline(2)">
      <v-icon name="pause"/>
    </b-button>
    <b-button variant="primary" :disabled="state === 1" @click="() => onClickTimeline(1)">
      <v-icon name="play"/>
    </b-button>
    <b-button variant="danger" :disabled="state === 0" @click="() => onClickTimeline(0)">
      <v-icon name="stop"/>
    </b-button>
  </b-button-group>
</template>

<script>
import { timeToTimestamp } from '../../../../services/date';

export default {
  props: {
    chart: Object,
    experiment: Object,
    currentTime: String
  },
  data() {
    return {
      state: 0,
      interval: null
    };
  },
  methods: {
    onClickTimeline(state) {
      this.state = state;

      switch (state) {
        case 0:
          this.stopTimeline();
          break;
        case 1:
          this.startTimeline();
          break;
        case 2:
          this.pauseTimeline();
          break;
      }
    },
    startTimeline() {
      const speed = 100;
      const currentDate = timeToTimestamp(this.currentTime, this.experiment.beginTime);
      this.chart.startTimeline(currentDate);

      this.interval = setInterval(() => {
        const newDate = this.chart.tickTimeline(speed);
        if (newDate.getTime() >= this.experiment.endTime) {
          clearInterval(this.interval);
          this.chart.stopTimeline();
        }
      }, speed);
    },
    pauseTimeline() {
      clearInterval(this.interval);
      this.chart.pauseTimeline();
    },
    stopTimeline() {
      clearInterval(this.interval);
      this.chart.stopTimeline();
    },
  }
}
</script>

