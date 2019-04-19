<template>
  <b-row>
    <!-- START TIME -->
    <b-col>
      <cleave
        v-model="startTime"
        class="form-control mt-2"
        placeholder="hh:mm:ss:sss"
        :options="options"
        :raw="false"
        @blur.native="onTimeChange"
        @keyup.native="onTimeChange"
      />
    </b-col>

    <!-- MENU -->
    <b-col cols="3">
      <chart-menu-measures
        :mod="mod"
        :service="service"
      />
      <chart-menu-mode
        :mod="mod"
        :service="service"
      />
    </b-col>

    <b-col cols="3">
      <chart-menu-player
        class="text-center"
        :mod="mod"
        :service="service"
      />
    </b-col>

    <b-col cols="2">
      <cleave
        v-model="currentTime"
        class="form-control mt-2"
        placeholder="hh:mm:ss:sss"
        :options="options"
        :raw="false"
        @blur.native="onTimeChange"
        @keyup.native="onTimeChange"
      />
    </b-col>

    <!-- END TIME -->
    <b-col>
      <cleave
        v-model="endTime"
        class="form-control mt-2"
        placeholder="hh:mm:ss:sss"
        :options="options"
        :raw="false"
        @blur.native="onTimeChange"
        @keyup.native="onTimeChange"
      />
    </b-col>
  </b-row>
</template>

<script>
import { dateToTime, timeToTimestamp } from '@/services/date';
import Measures from './menu/Measures';
import Mode from './menu/Mode';
import Player from './menu/Player';

export default {
  components: {
    'chart-menu-measures': Measures,
    'chart-menu-mode': Mode,
    'chart-menu-player': Player
  },
  props: {
    mod: {
      type: String,
      required: true
    },
    service: {
      type: Object,
      required: true
    }
  },
  computed: {
    experiment() {
      return this.$store.state[this.mod].experiment;
    },
    options() {
      return this.$store.state.options;
    },
    startTime: {
      get() {
        return this.$store.state[this.mod].startTime;
      },
      set(startTime) {
        this.$store.commit(`${this.mod}/SET_START_TIME`, startTime);
      }
    },
    endTime: {
      get() {
        return this.$store.state[this.mod].endTime;
      },
      set(endTime) {
        this.$store.commit(`${this.mod}/SET_END_TIME`, endTime);
      }
    },
    currentTime: {
      get() {
        return this.$store.state[this.mod].currentTime;
      },
      set(currentTime) {
        this.$store.dispatch(`${this.mod}/updateCurrentTime`, currentTime);
      }
    }
  },
  mounted() {
    /*
    this.service.addOnZoomListener((startDate, endDate) => {
      this.startTime = dateToTime(startDate);
      this.endTime = dateToTime(endDate);
    });
    */
    this.service.addOnDateListener(date => {
      this.currentTime = dateToTime(date);
    });
  },
  methods: {
    onTimeChange(e) {
      if (!this.service) {
        return;
      }
      if (e.keyCode === undefined || e.keyCode === 13) {
        let startDate = timeToTimestamp(this.startTime, this.experiment.beginTime);
        let endDate = timeToTimestamp(this.endTime, this.experiment.endTime);
        let currentDate = timeToTimestamp(this.currentTime, this.experiment.beginTime);
        startDate = this.validateDate(startDate);
        endDate = this.validateDate(endDate);
        currentDate = this.validateDate(currentDate);
        
        this.startTime = dateToTime(startDate);
        this.endTime = dateToTime(endDate);
        this.currentTime = dateToTime(currentDate);
        this.service.zoom(startDate, endDate);
      }
    },
    validateDate(date) {
      if (date < this.experiment.beginTime) {
        return this.experiment.beginTime;
      } else if (date > this.experiment.endTime) {
        return this.experiment.endTime;
      }
      return date;
    }
  }
};
</script>

