const TYPES_DESIGN_KEY = '_design/types';
const PLUGINS_DESIGN_KEY = '_design/plugins';
const MODIFICATIONS_DESIGN_KEY = '_design/modifications';
const PROTOCOLS_DESIGN_KEY = '_design/protocols';
const CONFIG_KEY = 'config';

export const DESIGNS = [
  { id: TYPES_DESIGN_KEY },
  { id: PLUGINS_DESIGN_KEY },
  { id: MODIFICATIONS_DESIGN_KEY },
  { id: PROTOCOLS_DESIGN_KEY },
  { id: CONFIG_KEY }
];

export const DESIGNS_MAPPER = {
  [TYPES_DESIGN_KEY]: {
    _id: TYPES_DESIGN_KEY,
    views: {
      findByType: function(doc, emit) {
        emit(doc.type);
      }.toString()
    }
  },
  [PLUGINS_DESIGN_KEY]: {
    _id: PLUGINS_DESIGN_KEY,
    views: {
      findAll: {
        map: function(doc, emit) {
          if (doc.type === 'plugin') {
            emit(doc.key, null);
          }
        }.toString()
      }
    }
  },
  [MODIFICATIONS_DESIGN_KEY]: {
    _id: MODIFICATIONS_DESIGN_KEY,
    views: {
      findByExperiment: {
        map: function(doc, emit) {
          if (doc.type === 'modification') {
            emit(doc.experimentId, null);
          }
        }.toString()
      }
    }
  },
  [PROTOCOLS_DESIGN_KEY]: {
    _id: PROTOCOLS_DESIGN_KEY,
    views: {
      findAll: {
        map: function(doc, emit) {
          if (doc.type === 'protocol') {
            emit(doc.key, null);
          }
        }.toString()
      }
    }
  },
  [CONFIG_KEY]: {
    _id: CONFIG_KEY,
    host: 'localhost',
    port: 8086,
    protocol: 'http',
    limit: 5
  }
};
