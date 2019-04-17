import Vue from 'vue';
import Vuex from 'vuex';
import { timeToDate } from '@/services/date';

Vue.use(Vuex);

const createChartModule = () => ({
  namespaced: true,
  state: {
    service: null,
    startTime: null,
    endTime: null,
    currentTime: null,
    measures: {},
    timeline: [],
    modification: {
      measure: null,
      startTime: null,
      endTime: null,
      operation: 'ADD',
      value: 0,
      isApply: false,
      isLoad: false,
      actions: null
    },
    modifications: []
  },
  mutations: {
    SET_SERVICE(state, service) {
      state.service = service;
    },
    SET_START_TIME(state, startTime) {
      state.startTime = startTime;
    },
    SET_END_TIME(state, endTime) {
      state.endTime = endTime;
    },
    SET_CURRENT_TIME(state, currentTIme) {
      state.currentTIme = currentTIme;
    },
    SET_MEASURES(state, measures) {
      state.measures = measures;
    },
    UPDATE_TIMELINE(state, date) {
      date = date ? date : timeToDate(state.currentTime);

      state.timeline = Object.values(state.measures).map(measure => {
        const data = state.service.getMeasureData(measure, date);
        return {
          measure: measure.name,
          type: measure.type,
          unit: measure.unit,
          value: data ? data.valueY : '-'
        };
      });
    },
    SET_MODIFICATIONS(state, modifications) {
      state.modifications = modifications;
    }
  },
  actions: {
    updateMeasures({ commit }, measures) {
      commit("SET_MEASURES", measures);
      commit("UPDATE_TIMELINE");
    },
    updateCurrentTime({ commit }, currentTime) {
      commit("SET_CURRENT_TIME", currentTime);
      commit("UPDATE_TIMELINE");
    }
  },
  getters: {
    measures: state => Object.values(state.measures),
    measuresId: (_, getters) => getters.measures.map(m => m.id)
  }
});

export const store = new Vuex.Store({
  state: {
    options: {
      blocks: [2, 2, 2, 4],
      delimiters: [':', ':', '.'],
      numericOnly: true,
      numeralPositiveOnly: true,
      stripLeadingZeroes: false
    }
  },
  modules: {
    default: createChartModule()
  },
  strict: true
});
