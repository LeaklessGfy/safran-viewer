import Vuex from 'vuex';

const store = new Vuex.Store({
  state: {
    charts: [
      {
        startTime: null,
        endTime: null,
        currentTime: null,
        selectedMeasures: {},
        timelineValues: [],
        modification: {},
        modifications: []
      }
    ]
  },
  mutations: {
    updateChart(state, payload) {
      state[payload.key] = payload.value;
    }
  },
  actions: {}
});

export default store;
