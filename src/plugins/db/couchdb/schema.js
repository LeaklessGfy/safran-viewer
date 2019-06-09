/* eslint-disable */
const MODIFICATIONS_DESIGN_KEY = '_design/modifications';
const PROTOCOLS_DESIGN_KEY = '_design/protocols';

export const DESIGNS = [
  { id: MODIFICATIONS_DESIGN_KEY },
  { id: PROTOCOLS_DESIGN_KEY }
];

export const DESIGNS_MAPPER = {
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
