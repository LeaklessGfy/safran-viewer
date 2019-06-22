import Vue from 'vue';
import Vuex from 'vuex';

import { fetchExperiment, fetchMeasure, fetchSamples, fetchAlarms } from '@/plugins/db/dbremote';

Vue.use(Vuex);

const applyModification = (modification, samples) => {
  return samples.map(sample => {
    if (modification.operation === 'ADD') {
      return {
        ...sample,
        value: (parseFloat(sample.value.replace(',', '.')) + modification.value) + '' // To fix
      };
    }
    return {
      ...sample,
      value: modification.value + '' // To fix
    };
  });
};

export const store = new Vuex.Store({
  strict: true,
  state: {
    currentDate: new Date(),
    experiments: {},
    measures: {},
    samples: {},
    alarms: {},
    modifications: {},
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
      state.currentDate = new Date(experiment.startDate);
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
    },
    TOGGLE_MODIFICATION(state, modification) {
      const id = modification.measure;
      if (state.modifications[id]) {
        delete state.modifications[id];
      } else {
        state.modifications[id] = modification;
      }
      state.samples = {
        ...state.samples
      };
    }
  },
  actions: {
    async fetchExperiments({ state, commit }, experimentsId) {
      const promises = [];
      for (const id of experimentsId) {
        if (!state.experiments[id]) {
          promises.push(
            fetchExperiment(id).then(experiment => experiment && commit('ADD_EXPERIMENT', experiment))
          );
        }
      }
      await Promise.all(promises);
    },
    async fetchMeasures({ state, commit }, measuresId) {
      const promises = [];
      for (const id of measuresId) {
        if (!state.measures[id]) {
          promises.push(
            fetchMeasure(id).then(measure => measure && commit('ADD_MEASURE', measure))
          );
        }
      }
      await Promise.all(promises);
    },
    async fetchSamples({ state, commit }, measuresId) {
      const promises = [];
      for (const id of measuresId) {
        if (!state.measures[id]) {
          promises.push(
            fetchMeasure(id).then(measure => measure && commit('ADD_MEASURE', measure))
          );
        }
        if (!state.samples[id]) {
          promises.push(
            fetchSamples(id).then(samples => samples && commit('ADD_SAMPLES', { id, samples }))
          );
        }
      }
      await Promise.all(promises);
    },
    async fetchAlarms({ state, commit }, experimentsId) {
      const promises = [];
      for (const id of experimentsId) {
        if (!state.experiments[id]) {
          promises.push(
            fetchAlarms(id).then(alarms => alarms && commit('ADD_ALARMS', { id, alarms }))
          );
        }
      }
      await Promise.all(promises);
    }
  },
  getters: {
    experimentSelector: state => (ids = []) => {
      return ids
        .filter(id => state.experiments[id])
        .map(id => state.experiments[id]);
    },
    measuresSelector: state => (ids = []) => {
      return ids
        .filter(id => state.measures[id])
        .map(id => state.measures[id]);
    },
    samplesSelector: state => (ids = []) => {
      return ids
        .filter(id => state.measures[id] && state.samples[id])
        .map(id => ({ measure: state.measures[id], samples: state.samples[id] }))
        .map(full => {
          if (state.modifications[full.measure.id]) {
            full.samples = applyModification(state.modifications[full.measure.id], full.samples);
          }
          return full;
        });
    },
    alarmsSelector: state => (ids = []) => {
      return ids
        .filter(id => state.alarms[id])
        .map(id => state.alarms[id]);
    },
    oneExperimentSelector: state => id=> {
      return state.experiments[id] ? state.experiments[id] : null;
    },
    oneAlarmsSelector: state => id => {
      return state.alarms[id] ? state.alarms[id] : [];
    }
  }
});
