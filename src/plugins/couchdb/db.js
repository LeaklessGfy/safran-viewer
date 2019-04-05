import PouchDB from 'pouchdb';
import { DESIGNS, DESIGNS_MAPPER } from './schema';

const DATABASE_NAME = 'safran_db';

export default class Database {
  _db;
  _limit;

  /* SUBJECTS */
  _errorsSubject;
  _loadingSubject;
  _experimentSubject;
  _experimentsSubject;
  _benchsSubject;
  _campaignsSubject;
  _measuresSubject;

  constructor(
    errors, loading, experiment, experiments,
    benchs, campaigns, measures
  ) {
    this._limit = 5;

    this._errorsSubject = errors;
    this._loadingSubject = loading;
    this._experimentSubject = experiment;
    this._experimentsSubject = experiments
    this._benchsSubject = benchs;
    this._campaignsSubject = campaigns;
    this._measuresSubject = measures;

    this.openDatabase();
    this.install();
  }

  getHost() {
    return 'local';
  }

  setHost(host) {}

  getLimit() {
    return this._limit;
  }

  setLimit(limit) {
    this._limit = limit;
  }

  fetchExperiment(id) {
    this._loadingSubject.next(true);
    this._db.get(id)
    .then(result => {
      this._experimentSubject.next(result);
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._experimentSubject.next({});
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
    return this._experimentSubject;
  }

  fetchExperiments(page = 1) {
    this._loadingSubject.next(true);
    this._db.query('experiments/findAll', {
      include_docs: true,
      limit: this._limit,
      skip: this._limit * (page - 1)
    })
    .then(values => {
      const result = values.rows;
      result.total = values.total_rows;
      result.current = page;
      result.limit = this._limit; 
      this._experimentsSubject.next(result);
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._experimentsSubject.next([]);
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
    return this._experimentsSubject;
  }

  fetchBenchs() {
    this._loadingSubject.next(true);
    this._db.query('benchs/findAll', { group: true })
    .then(result => {
      this._benchsSubject.next(result.rows);
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._benchsSubject.next([]);
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
    return this._benchsSubject;
  }

  fetchCampaigns() {
    this._loadingSubject.next(true);
    this._db.query('campaigns/findAll', { group: true })
    .then(result => {
      this._campaignsSubject.next(result.rows);
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._campaignsSubject.next([]);
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
    return this._campaignsSubject;
  }

  fetchMeasures(experimentId, page = 1) {
    this._loadingSubject.next(true);
    this._db.query('measures/findByExperiment', {
      key: experimentId,
      limit: this._limit,
      skip: this._limit * (page - 1)
    })
    .then(values => {
      const result = values.rows;
      result.total = values.total_rows;
      result.current = page;
      result.limit = this._limit;
      this._measuresSubject.next(result);
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._measuresSubject.next([]);
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
    return this._measuresSubject;
  }

  fetchSamples(measureId) {
    this._loadingSubject.next(true);
    return this._db.query('samples/findByMeasure', {
      key: measureId
    })
    .catch(err => {
      this._errorsSubject.next(err);
      throw err;
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
  }

  fetchAlarms(experimentId) {
    this._loadingSubject.next(true);
    return this._db.query('alarms/findByExperiment', {
      key: experimentId
    })
    .catch(err => {
      this._errorsSubject.next(err);
      throw err;
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
  }

  fetchModifications(experimentId) {
    this._loadingSubject.next(true);
    return this._db.query('modifications/findByExperiment', {
      key: experimentId
    })
    .catch(err => {
      this._errorsSubject.next(err);
      throw err;
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
  }

  insertExperiment(experiment) {

  }

  insertMeasures(experimentId, measures) {

  }

  insertSamples(experimentId, samples, date = new Date()){

  }

  insertAlarms(experimentId, alarms, date = new Date()) {

  }

  insertModifications(experimentId, modifications) {

  }

  removeExperiment(id) {

  }

  async changes() {
    return {
      local: [],
      remote: [],
      length: 0
    };
  }

  openDatabase() {
    this._loadingSubject.next(true);
    this._db = new PouchDB(DATABASE_NAME, {
      auto_compaction: true
    });
    
    return new Promise(r => r());
  }

  install() {
    this._loadingSubject.next(true);

    return this._db.bulkGet({ docs: DESIGNS })
    .then(results => {
      for (let result of results.results) {
        for (let doc of result.docs) {
          if (doc.ok && doc.ok.views && Object.keys(doc.ok.views).length > 0) {
            this._db.remove(doc.ok._id, doc.ok._rev);
          }
        }
        this._db.put(DESIGNS_MAPPER[result.id]);
      }
    })
    .catch (err => {
      this._errorsSubject.next(err);
      throw err;
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
  }

  drop() {
    this._loadingSubject.next(true);
    return this._db.destroy()
    .catch(err => {
      this._errorsSubject.next(err);
      throw err;
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
  }

  async _insertDoc(doc) {
    try {
      return await this._db.post(doc);
    } catch (err) {
      this._errorsSubject.next(err);
      return null;
    }
  }

  async _insertMultipleDocs(docs) {
    try {
      return await this._db.bulkDocs(docs);
    } catch (err) {
      this._errorsSubject.next(err);
      return null;
    }
  }
}
