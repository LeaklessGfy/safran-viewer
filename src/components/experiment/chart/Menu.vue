<template>
  <b-row>
    <!-- START TIME -->
    <b-col>
      <cleave
        v-model="startTime"
        class="form-control mt-2"
        placeholder="hh:mm:ss,ssss"
        :options="options"
        :raw="false"
        @blur.native="onTimeChange"
        @keyup.native="onTimeChange"
      />
    </b-col>

    <!-- MENU -->
    <b-col cols="3">
      <chart-menu-measures :ref-id="refId" />
      <chart-menu-mode :ref-id="refId" />
    </b-col>

    <b-col cols="3">
      <chart-menu-player
        class="text-center"
        :ref-id="refId"
        :experiment="experiment"
      />
    </b-col>

    <b-col cols="2">
      <cleave
        v-model="currentTime"
        class="form-control mt-2"
        placeholder="hh:mm:ss,ssss"
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
        placeholder="hh:mm:ss,ssss"
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
import { mapState } from 'vuex';

export default {
  components: {
    'chart-menu-measures': Measures,
    'chart-menu-mode': Mode,
    'chart-menu-player': Player
  },
  props: {
    refId: {
      type: Number,
      required: true
    },
    experiment: {
      type: Object,
      required: true
    }
  },
  computed: {
    startTime: {
      get() {
        return this.$store.state.charts[this.refId].startTime;
      },
      set(startTime) {
        this.$store.commit('updateChart', {
          refId: this.refId,
          startTime
        });
      }
    },
    endTime: {
      get() {
        return this.$store.state.charts[this.refId].endTime;
      },
      set(endTime) {
        this.$store.commit('updateChart', {
          refId: this.refId,
          endTime
        });
      }
    },
    currentTime: {
      get() {
        return this.$store.state.charts[this.refId].currentTime;
      },
      set(currentTime) {
        this.$store.commit('updateChart', {
          refId: this.refId,
          currentTime
        });
      }
    },
    ...mapState({
      chart(state) {
        return state.charts[this.refId].chart;
      },
      options: state => state.options
    })
  },
  mounted() {
    this.currentTime = dateToTime(this.experiment.beginTime);
    this.chart.addOnZoomListener((startDate, endDate) => {
      this.startTime = dateToTime(startDate);
      this.endTime = dateToTime(endDate);
    });
    this.chart.addOnDateListener(date => {
      this.currentTime = dateToTime(date);
    });
  },
  methods: {
    onTimeChange(e) {
      if (!this.chart) {
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
        this.chart.zoom(startDate, endDate);
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
}
</script>

