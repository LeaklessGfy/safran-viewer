export const EXPERIMENTS_DESIGN_KEY = '_design/experiments';
export const BENCHS_DESIGN_KEY = '_design/benchs';
export const CAMPAIGNS_DESIGN_KEY = '_design/campaigns';
export const MEASURES_DESIGN_KEY = '_design/measures';

export const BULK_DESIGNS = [
  { id: EXPERIMENTS_DESIGN_KEY },
  { id: BENCHS_DESIGN_KEY },
  { id: CAMPAIGNS_DESIGN_KEY },
  { id: MEASURES_DESIGN_KEY }
];

export const EXPERIMENTS_DESIGN = {
  _id: EXPERIMENTS_DESIGN_KEY,
  views: {
    findAll: {
      map: function (doc) {
        if (doc.typeX === 'experiment') {
          emit(doc._id);
        }
      }.toString()
    }
  }
};

export const BENCHS_DESIGN = {
  _id: BENCHS_DESIGN_KEY,
  views: {
    findAll: {
      map: function (doc) {
        if (doc.typeX === 'experiment') {
          emit(doc.campaign.id12c, doc.campaign);
        }
      }.toString(),
      reduce: function (keys, values) {
        return values[0];
      }.toString()
    }
  }
};

export const CAMPAIGNS_DESIGN = {
  _id: CAMPAIGNS_DESIGN_KEY,
  views: {
    findAll: {
      map: function (doc) {
        if (doc.typeX === 'experiment') {
          emit(doc.campaign.id12c, doc.campaign);
        }
      }.toString(),
      reduce: function (keys, values) {
        return values[0];
      }.toString()
    }
  }
};

export const MEASURES_DESIGN = {
  _id: MEASURES_DESIGN_KEY,
  views: {
    findAll: {
      map: function (doc) {
        if (doc.typeX === 'measure') {
          emit(doc.experiment, { name: doc.name, type: doc.type, unit: doc.unit });
        }
      }.toString()
    }
  }
};

export const MAPPER_DESIGNS = {
  [EXPERIMENTS_DESIGN_KEY]: EXPERIMENTS_DESIGN,
  [BENCHS_DESIGN_KEY]: BENCHS_DESIGN,
  [CAMPAIGNS_DESIGN_KEY]: CAMPAIGNS_DESIGN,
  [MEASURES_DESIGN_KEY]: MEASURES_DESIGN
};
