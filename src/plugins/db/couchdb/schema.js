/* eslint-disable */

const EXPERIMENTS_DESIGN_KEY = '_design/experiments';
const BENCHS_DESIGN_KEY = '_design/benchs';
const CAMPAIGNS_DESIGN_KEY = '_design/campaigns';
const MEASURES_DESIGN_KEY = '_design/measures';
const SAMPLES_DESIGN_KEY = '_design/samples';
const MODIFICATIONS_DESIGN_KEY = '_design/modifications';

export const DESIGNS = [
  { id: EXPERIMENTS_DESIGN_KEY },
  { id: BENCHS_DESIGN_KEY },
  { id: CAMPAIGNS_DESIGN_KEY },
  { id: MEASURES_DESIGN_KEY },
  { id: SAMPLES_DESIGN_KEY },
  { id: MODIFICATIONS_DESIGN_KEY }
];

const EXPERIMENTS_DESIGN = {
  _id: EXPERIMENTS_DESIGN_KEY,
  views: {
    findAll: {
      map: function(doc) {
        if (doc.typeX === 'experiment') {
          emit(doc._id);
        }
      }.toString()
    }
  }
};

const BENCHS_DESIGN = {
  _id: BENCHS_DESIGN_KEY,
  views: {
    findAll: {
      map: function(doc) {
        if (doc.typeX === 'experiment') {
          emit(doc.bench.reference, doc.bench);
        }
      }.toString(),
      reduce: function(keys, values) {
        return values[0];
      }.toString()
    }
  }
};

const CAMPAIGNS_DESIGN = {
  _id: CAMPAIGNS_DESIGN_KEY,
  views: {
    findAll: {
      map: function(doc) {
        if (doc.typeX === 'experiment') {
          emit(doc.campaign.id12c, doc.campaign);
        }
      }.toString(),
      reduce: function(keys, values) {
        return values[0];
      }.toString()
    }
  }
};

const MEASURES_DESIGN = {
  _id: MEASURES_DESIGN_KEY,
  views: {
    findAll: {
      map: function(doc) {
        if (doc.typeX === 'measure') {
          emit(doc.experiment, {
            name: doc.name,
            type: doc.type,
            unit: doc.unit
          });
        }
      }.toString()
    }
  }
};

const SAMPLES_DESIGN = {
  _id: SAMPLES_DESIGN_KEY,
  views: {
    findByMeasure: {
      map: function(doc) {
        if (doc.typeX === 'sample') {
          emit(doc.measure, { time: doc.time, value: doc.value });
        }
      }.toString()
    }
  }
};

const MODIFICATIONS_DESIGN = {
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
};

export const DESIGNS_MAPPER = {
  [EXPERIMENTS_DESIGN_KEY]: EXPERIMENTS_DESIGN,
  [BENCHS_DESIGN_KEY]: BENCHS_DESIGN,
  [CAMPAIGNS_DESIGN_KEY]: CAMPAIGNS_DESIGN,
  [MEASURES_DESIGN_KEY]: MEASURES_DESIGN,
  [SAMPLES_DESIGN_KEY]: SAMPLES_DESIGN,
  [MODIFICATIONS_DESIGN_KEY]: MODIFICATIONS_DESIGN
};
