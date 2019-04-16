import Vue from 'vue';
import Vuex from 'vuex';
import { timeToDate } from '@/services/date';

Vue.use(Vuex);

const measures = (state, refId) => Object.values(state.charts[refId].selectedMeasures);

export const store = new Vuex.Store({
  state: {
    charts: [
      {
        chart: null,
        startTime: null,
        endTime: null,
        currentTime: null,
        selectedMeasures: {},
        timelineValues: [],
        modification: {
          measure: null,
          startTime: null,
          endTime: null,
          operation: 'ADD',
          value: 0,
          isApply: false,
          actions: null
        },
        modifications: []
      }
    ],
    options: {
      blocks: [2, 2, 2, 4],
      delimiters: [':', ':', '.'],
      numericOnly: true,
      numeralPositiveOnly: true,
      stripLeadingZeroes: false
    }
  },
  mutations: {
    updateChart(state, payload) {
      for (let key of Object.keys(payload)) {
        if (key === 'refId') continue;
        state.charts[payload.refId][key] = payload[key];
      }
    },
    updateTimelineValues(state, payload) {
      const chart = state.charts[payload.refId];
      const date = payload.date ? payload.date : timeToDate(chart.currentTime);

      chart.timelineValues = measures(state, payload.refId).map(measure => {
        const data = chart.chart.getMeasureData(measure, date);
        return {
          measure: measure.name,
          type: measure.type,
          unit: measure.unit,
          value: data ? data.valueY : '-'
        };
      });
    }
  },
  actions: {},
  getters: {
    measures: state => refId => measures(state, refId)
  }
});
