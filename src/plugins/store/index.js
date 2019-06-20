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
    async fetchExperiments({ state, commit }, experimentsId) {
      const promises = [];
      for (const id of experimentsId) {
        if (!state.experiments[id]) {
          promises.push(fetchExperiment(id).then(experiment => commit('ADD_EXPERIMENT', experiment)));
        }
      }
      await Promise.all(promises);
    },
    async fetchMeasures({ state, commit }, measuresId) {
      const promises = [];
      for (const id of measuresId) {
        if (!state.measures[id]) {
          promises.push(fetchMeasure(id).then(measure => commit('ADD_MEASURE', measure)));
        }
      }
      await Promise.all(promises);
    },
    async fetchSamples({ state, commit }, measuresId) {
      const promises = [];
      for (const id of measuresId) {
        if (!state.measures[id]) {
          promises.push(fetchMeasure(id).then(measure => commit('ADD_MEASURE', measure)));
        }
        if (!state.samples[id]) {
          promises.push(fetchSamples(id).then(samples => commit('ADD_SAMPLES', { id, samples })));
        }
      }
      await Promise.all(promises);
    },
    async fetchAlarms({ state, commit }, experimentsId) {
      const promises = [];
      for (const id of experimentsId) {
        if (!state.experiments[id]) {
          promises.push(fetchAlarms(id).then(alarms => commit('ADD_ALARMS', { id, alarms })));
        }
      }
      await Promise.all(promises);
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
        .filter(id => state.measures[id])
        .map(id => state.measures[id]);
    },
    samplesSelector: state => (ids = []) => {
      return ids
        .filter(id => state.measures[id] && state.samples[id])
        .map(id => ({ measure: state.measures[id], samples: state.samples[id] }));
    },
    alarmsSelector: state => id => {
      if (!state.alarms[id]) {
        return [];
      }
      return state.alarms[id];
    }
  }
});
