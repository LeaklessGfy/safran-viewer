/* eslint-disable */
const PLUGINS_DESIGN_KEY = '_design/plugins';
const MODIFICATIONS_DESIGN_KEY = '_design/modifications';
const PROTOCOLS_DESIGN_KEY = '_design/protocols';

export const DESIGNS = [
  { id: PLUGINS_DESIGN_KEY },
  { id: MODIFICATIONS_DESIGN_KEY },
  { id: PROTOCOLS_DESIGN_KEY }
];

export const DESIGNS_MAPPER = {
  [PLUGINS_DESIGN_KEY]: {
    _id: PLUGINS_DESIGN_KEY,
    views: {
      findAll: {
        map: function(doc) {
          if (doc.typeX === 'plugin') {
            emit(doc.id, null);
          }
        }.toString()
      }
    }
  },
  [MODIFICATIONS_DESIGN_KEY]: {
    _id: MODIFICATIONS_DESIGN_KEY,
    views: {
      findByExperiment: {
        map: function(doc) {
          if (doc.typeX === 'modification') {
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
        map: function(doc) {
          if (doc.typeX === 'protocol') {
            emit(doc.key, null);
          }
        }.toString()
      }
    }
  }
};
