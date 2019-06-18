import Vue from 'vue';
import Vuex from 'vuex';

import { fetchExperiment, fetchMeasure, fetchSamples, fetchAlarms } from '@/plugins/db/dbremote';

Vue.use(Vuex);

export const store = new Vuex.Store({
  strict: true,
  state: {
    currentDate: null,
    experiments: {},
    measures: {},
    samples: {},
    alarms: {},
    options: {
      blocks: [2, 2, 2, 3],
      delimiters: [':', ':', '.'],
      numericOnly: true,
      numeralPositiveOnly: true,
      stripLeadingZeroes: false
    }
  },
  mutations: {
    SET_CURRENT_DATE(state, currentDate) {
      state.currentDate = currentDate;
    },
    ADD_EXPERIMENT(state, experiment) {
      state.experiments = {
        ...state.experiments,
        [experiment.id]: experiment
      };
    },
    ADD_MEASURE(state, measure) {
      state.measures = {
        ...state.measures,
        [measure.id]: measure
      };
    },
    ADD_SAMPLES(state, { id, samples }) {
      state.samples = {
        ...state.samples,
        [id]: samples
      };
    },
    ADD_ALARMS(state, { id, alarms }) {
      state.alarms = {
        ...state.alarms,
        [id]: alarms
      };
    }
  },
  actions: {
    async fetchExperiment({ state, commit }, experimentId) {
      if (state.experiments[experimentId]) {
        return;
      }
      const experiment = await fetchExperiment(experimentId);
      commit('ADD_EXPERIMENT', experiment);
    },
    async fetchMeasures({ state, commit }, measuresId) {
      for (const id of measuresId) {
        if (state.measures[id]) {
          continue;
        }
        const measure = await fetchMeasure(id);
        commit('ADD_MEASURE', measure);
      }
    },
    async fetchSamples({ state, commit }, measuresId) {
      for (const id of measuresId) {
        if (state.samples[id]) {
          continue;
        }
        const samples = await fetchSamples(id);
        commit('ADD_SAMPLES', { id, samples });
      }
    },
    async fetchAlarms({ state, commit }, experimentId) {
      if (state.alarms[experimentId]) {
        return;
      }
      const alarms = await fetchAlarms(experimentId);
      commit('ADD_ALARMS', { id: experimentId, alarms });
    }
  },
  getters: {
    experimentSelector: state => id => {
      if (!state.experiments[id]) {
        return null;
      }
      return state.experiments[id];
    },
    measuresSelector: state => (ids = []) => {
      return ids
        .map(id => {
          if (!state.measures[id]) {
            return null;
          }
          return state.measures[id];
        })
        .filter(measure => measure !== null);
    },
    samplesSelector: state => (ids = []) => {
      return ids
        .map(id => {
          if (!state.samples[id]) {
            return null;
          }
          return state.samples[id];
        })
        .filter(sample => sample !== null);
    },
    alarmsSelector: state => id => {
      if (!state.alarms[id]) {
        return null;
      }
      return state.alarms[id];
    }
  }
});
