<template>
  <b-row>
    <!-- START TIME -->
    <b-col>
      <cleave
        v-model="startTime"
        :options="options"
        class="form-control mt-2"
        placeholder="hh:mm:ss,ssss"
        :raw="false"
        @blur.native="onTimeChange"
        @keyup.native="onTimeChange"
      />
    </b-col>

    <!-- MENU -->
    <b-col cols="3">
      <chart-menu-measures :onOkMeasure="onOkMeasure" />
      
      <chart-menu-mode :chart="chart" />
    </b-col>

    <b-col cols="3">
      <chart-menu-player :chart="chart" :experiment="experiment" :currentTime="currentTime" class="text-center" />
    </b-col>

    <b-col cols="2">
      <cleave
        v-model="currentTime"
        :options="options"
        class="form-control mt-2"
        placeholder="hh:mm:ss,ssss"
        :raw="false"
        @blur.native="onTimeChange"
        @keyup.native="onTimeChange"
      />
    </b-col>

    <!-- END TIME -->
    <b-col>
      <cleave
        v-model="endTime"
        :options="options"
        class="form-control mt-2"
        placeholder="hh:mm:ss,ssss"
        :raw="false"
        @blur.native="onTimeChange"
        @keyup.native="onTimeChange"
      />
    </b-col>
  </b-row>
</template>

<script>
import { dateToTime, timeToTimestamp } from '../../../services/date';
import Measures from './menu/Measures';
import Mode from './menu/Mode';
import Player from './menu/Player';

export default {
  props: {
    chart: Object,
    experiment: Object,
    onOkMeasure: Function
  },
  data() {
    return {
      startTime: null,
      endTime: null,
      currentTime: null,
      options: {
        blocks: [2, 2, 2, 4],
        delimiters: [':', ':', '.'],
        numericOnly: true,
        numeralPositiveOnly: true,
        stripLeadingZeroes: false
      },
    };
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
  },
  components: {
    'chart-menu-measures': Measures,
    'chart-menu-mode': Mode,
    'chart-menu-player': Player
  }
}
</script>

