import Vue from 'vue';
import Vuex from 'vuex';
import { dateToTime, timeToDate } from '@/services/date';
import { ChartContext } from '@/services/chart';
import { DB } from '@/plugins/db/db';

Vue.use(Vuex);

const createChartModule = mod => ({
  namespaced: true,
  state: {
    mod,
    experiment: null,
    startTime: null,
    endTime: null,
    currentTime: null,
    measures: {},
    timeline: [],
    modifications: []
  },
  mutations: {
    RESET(state) {
      state.experiment = null;
      state.startTime = null;
      state.endTime = null;
      state.currentTime = null;
      state.measures = {};
      state.timeline = [];
      state.modifications = [];
    },
    SET_EXPERIMENT(state, experiment) {
      state.experiment = experiment;
      state.startTime = dateToTime(experiment.startDate);
      state.endTime = dateToTime(experiment.endDate);
      state.currentTime = dateToTime(experiment.startDate);
    },
    SET_START_TIME(state, startTime) {
      state.startTime = startTime;
    },
    SET_END_TIME(state, endTime) {
      state.endTime = endTime;
    },
    SET_CURRENT_TIME(state, currentTime) {
      state.currentTime = currentTime;
    },
    SET_MEASURES(state, measures) {
      state.measures = measures;
    },
    UPDATE_TIMELINE(state, date) {
      if (!date && state.currentTime) {
        date = timeToDate(state.currentTime, state.experiment.startDate);
      }

      state.timeline = Object.values(state.measures).map(measure => {
        const data = ChartContext[state.mod].getMeasureData(measure, date);
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
    },
    UPDATE_MODIFICATIONS(state) {
      state.modifications = state.modifications.map(modification => {
        modification.isLoad = state.measures[modification.measure] ? true : false;
        return modification;
      });
    },
    ADD_MODIFICATION(state, modification) {
      modification.isLoad = state.measures[modification.measure] ? true : false;
      state.modifications.push(modification);
    },
    TOGGLE_MODIFICATION(state, modification) {
      state.modifications = state.modifications.map(m => {
        if (m === modification) m.isApply = !m.isApply;
        return m;
      });
    }
  },
  actions: {
    fetchExperiment({ commit }, id) {
      DB.fetchExperiment(id)
      .then(experiment => {
        commit('SET_EXPERIMENT', experiment);
      });
    },
    updateCurrentTime({ commit }, currentTime) {
      commit('SET_CURRENT_TIME', currentTime);
      commit('UPDATE_TIMELINE');
    },
    updateMeasures({ commit }, measures) {
      commit('SET_MEASURES', measures);
      commit('UPDATE_TIMELINE');
      commit('UPDATE_MODIFICATIONS');
    },
    addMeasure({ state, commit }, measure) {
      commit('SET_MEASURES', { ...state.measures, [measure.id]: measure });
      commit('UPDATE_TIMELINE');
      commit('UPDATE_MODIFICATIONS');
    },
    insertModification({ state, commit }, modification) {
      DB.insertModification(modification, state.experiment)
      .then(modification => {
        commit('ADD_MODIFICATION', modification);
      });
    },
    removeModification({ state, commit }, modification) {
      DB.removeModification(modification)
      .then(() => {
        commit('SET_MODIFICATIONS', state.modifications.filter(m => m !== modification));
      });
    },
    fetchModifications({ commit }, experimentId) {
      DB.fetchModifications(experimentId)
      .then(modifications => {
        commit('SET_MODIFICATIONS', modifications);
        commit('UPDATE_MODIFICATIONS');
      });
    }
  },
  getters: {
    measures: state => Object.values(state.measures),
    measuresId: (_, getters) => getters.measures.map(m => m.id)
  }
});

export const store = new Vuex.Store({
  strict: true,
  state: {
    experiments: [],
    experimentsSelector: {},
    measures: [],
    measuresSelector: {},
    samplesSelector: {},
    currentDate: null,
    protocols: {
      iena: {
        ip: '',
        port: 1234,
        moduleName: '',
        mac: '',
        key: 1,
        frequency: 500
      },
      ddsrti: {
        ip: '',
        domainId: 1,
        topic: ''
      },
      avis: {
        url: ''
      }
    },
    options: {
      blocks: [2, 2, 2, 3],
      delimiters: [':', ':', '.'],
      numericOnly: true,
      numeralPositiveOnly: true,
      stripLeadingZeroes: false
    }
  },
  mutations: {
    SET_EXPERIMENTS(state, experiments) {
      state.experiments = experiments;
    },
    ADD_EXPERIMENT_SELECTOR(state, experiment) {
      state.experimentsSelector = {
        ...state.experimentsSelector,
        [experiment.id]: experiment
      };
    },
    SET_MEASURES(state, measures) {
      state.measures = measures;
    },
    ADD_MEASURE_SELECTOR(state, measure) {
      state.measuresSelector = {
        ...state.measuresSelector,
        [measure.id]: measure
      };
    },
    ADD_SAMPLE_SELECTOR(state, { id, sample }) {
      state.samplesSelector = {
        ...state.samplesSelector,
        [id]: sample
      };
    },
    SET_CURRENT_DATE(state, currentDate) {
      state.currentDate = currentDate;
    },
    SET_PROTOCOLS(state, protocols) {
      state.protocols = protocols;
    },
    SET_PROTOCOL(state, { key, protocol }) {
      state.protocols[key] = protocol;
    }
  },
  actions: {
    fetchExperiments({ commit }, page = 1) {
      DB.fetchExperiments(page)
      .then(experiments => {
        commit('SET_EXPERIMENTS', experiments);
      });
    },
    async fetchExperimentSelector({ state, commit }, experimentId) {
      if (state.experimentsSelector[experimentId]) {
        return;
      }
      const experiment = await DB.fetchExperiment(experimentId);
      commit('ADD_EXPERIMENT_SELECTOR', experiment);
    },
    fetchMeasures({ commit }, { experimentId, page }) {
      DB.fetchMeasures(experimentId, page)
      .then(measures => {
        commit('SET_MEASURES', measures);
      });
    },
    async fetchMeasuresSelector({ state, commit }, measuresId) {
      for (const id of measuresId) {
        if (state.measuresSelector[id]) {
          continue;
        }
        const measure = await DB.fetchMeasure(id);
        commit('ADD_MEASURE_SELECTOR', measure);
      }
    },
    async fetchSamplesSelector({ state, commit }, measuresId) {
      for (const id of measuresId) {
        if (state.samplesSelector[id]) {
          continue;
        }
        const sample = await DB.fetchSamples(id);
        commit('ADD_SAMPLE_SELECTOR', { id, sample });
      }
    },
    fetchProtocols({ commit }) {
      DB.fetchProtocols()
      .then(protocols => {
        commit('SET_PROTOCOLS', protocols);
      });
    }
  },
  modules: {
    default: createChartModule('default')
  },
  getters: {
    experimentSelector: state => id => {
      if (!state.experimentsSelector[id]) {
        return null;
      }
      return state.experimentsSelector[id];
    },
    measuresSelector: state => (ids = []) => {
      return ids
        .map(id => {
          if (!state.measuresSelector[id]) {
            return null;
          }
          return state.measuresSelector[id];
        })
        .filter(measure => measure !== null);
    },
    samplesSelector: state => (ids = []) => {
      return ids
        .map(id => {
          if (!state.samplesSelector[id]) {
            return null;
          }
          return state.samplesSelector[id];
        })
        .filter(sample => sample !== null);
    }
  }
});
