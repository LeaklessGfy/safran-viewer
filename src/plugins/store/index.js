import Vue from 'vue';
import Vuex from 'vuex';
import { timeToDate } from '@/services/date';
import { ChartContext } from '@/services/chart';
import { DB } from '@/plugins/db/db';

Vue.use(Vuex);

const createChartModule = (mod) => ({
  namespaced: true,
  state: {
    mod,
    startTime: null,
    endTime: null,
    currentTime: null,
    measures: {},
    timeline: [],
    modifications: []
  },
  mutations: {
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
      if (!date) {
        date = timeToDate(state.currentTime);
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
      state.modification.push(modification);
    },
    TOGGLE_MODIFICATION(state, modification) {
      state.modifications = state.modifications.map(m => {
        if (m === modification) m.isApply = !m.isApply;
        return m;
      });
    }
  },
  actions: {
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
    insertModification({ commit }, modification) {
      DB.insertModification(modification)
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
