import Vue from 'vue';
import Vuex from 'vuex';

import { fetchExperiment, fetchMeasure, fetchSamples, fetchAlarms } from '@/plugins/db/dbremote';

Vue.use(Vuex);

const applyModification = (modification, samples) => {
  return samples.map(sample => {
    if (sample.time < modification.startDate || sample.time > modification.endDate) {
      return sample;
    }

    const result = modification.operation === 'ADD' ?
      parseFloat(sample.value.replace(',', '.')) + parseInt(modification.value, 10)
      :
      modification.value;

    return {
      ...sample,
      value: result + ''
    };
  });
};

export const store = new Vuex.Store({
  strict: true,
  state: {
    currentDate: new Date(),
    speed: 300,
    experiments: {},
    measures: {},
    samples: {},
    alarms: {},
    modifications: [],
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
    SET_SPEED(state, speed) {
      state.speed = speed;
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
      if (state.modifications.find(m => m._id === modification._id)) {
        state.modifications = state.modifications.filter(m => m._id !== modification._id);
      } else {
        state.modifications = state.modifications.concat(modification);
      }
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
          for (const modification of state.modifications) {
            if (modification.measure === full.measure.id) {
              full.samples = applyModification(modification, full.samples);
            }
          }
          return full;
        });
    },
    alarmsSelector: state => (ids = []) => {
      return ids
        .filter(id => state.alarms[id])
        .map(id => state.alarms[id]);
    },
    modificationsSelector: state => (ids = []) => {
      return ids
        .filter(id => state.modifications.find(m => m.measure === id) !== null)
        .flatMap(id => state.modifications.filter(m => m.measure === id));
    },
    oneExperimentSelector: state => id=> {
      return state.experiments[id] ? state.experiments[id] : null;
    },
    oneAlarmsSelector: state => id => {
      return state.alarms[id] ? state.alarms[id] : [];
    }
  }
});
