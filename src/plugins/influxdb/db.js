import * as Influx from 'influx';
import { Subject, BehaviorSubject } from 'rxjs';
import uuidv4 from 'uuid/v4';
import Schema from './schema';
import { dateToTimestamp, timeToTimestamp } from '../../services/date';

const REMOTE_HOST = 'localhost:8086';
const DATABASE_NAME = 'safran_db';

const LIMIT = 5;

class Database {
  _db;

  /* SUBJECTS */
  _errorsSubject;
  _experimentSubject;
  _experimentsSubject;
  _benchsSubject;
  _campaignsSubject;
  _measuresSubject;

  constructor() {
    this._db = new Influx.InfluxDB({
      host: REMOTE_HOST,
      database: DATABASE_NAME,
      schema: Schema
    });

    this._errorsSubject = new Subject();
    this._experimentSubject = new BehaviorSubject({});
    this._experimentsSubject = new BehaviorSubject([]);
    this._benchsSubject = new BehaviorSubject([]);
    this._campaignsSubject = new BehaviorSubject([]);
    this._measuresSubject = new BehaviorSubject([]);

    this.install();
  }

  getErrors() {
    return this._errorsSubject;
  }

  getExperiment() {
    return this._experimentSubject;
  }

  getExperiments() {
    return this._experimentsSubject;
  }

  getBenchs() {
    return this._benchsSubject;
  }

  getCampaigns() {
    return this._campaignsSubject;
  }

  getMeasures() {
    return this._measuresSubject;
  }

  countExperiments() {
    return this._db.query('SELECT count(*) FROM experiments');
  }

  countMeasures(id) {
    return this._db.query(`SELECT count(*) FROM measures WHERE "experimentId"=${Influx.escape.stringLit(id)}`);
  }

  fetchExperiment(id) {
    this._db.query(`SELECT * FROM experiments WHERE "id"=${Influx.escape.stringLit(id)} LIMIT 1;`)
    .then(result => {
      if (result.length < 1) {
        throw new Error('Experiment not found with id ' + id);
      }
      this._experimentSubject.next(result[0]);
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._experimentSubject.next({});
    });
    return this._experimentSubject;
  }

  fetchExperiments(page = 1) {
    this._db.query(`SELECT * FROM experiments LIMIT ${LIMIT} OFFSET ${(page - 1) * LIMIT};`)
    .then(result => {
      this._experimentsSubject.next(result);
    }).catch(err => {
      this._errorsSubject.next(err);
      this._experimentsSubject.next([]);
    });
    return this._experimentsSubject;
  }

  fetchBenchs() {
    this._db.query('SELECT DISTINCT(bench) FROM experiments;')
    .then(result => {
      this._benchsSubject.next(result.map(r => JSON.parse(r.distinct)));
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._benchsSubject.next([]);
    });
    return this._benchsSubject;
  }

  fetchCampaigns() {
    this._db.query('SELECT DISTINCT(campaign) FROM experiments;')
    .then(result => {
      this._campaignsSubject.next(result.map(r => JSON.parse(r.distinct)));
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._campaignsSubject.next([]);
    });
    return this._campaignsSubject;
  }

  fetchMeasures(experimentId, page = 1) {
    this._db.query(
      `SELECT * FROM measures
      WHERE "experimentId"=${Influx.escape.stringLit(experimentId)}
      LIMIT ${LIMIT}
      OFFSET ${(page - 1) * LIMIT};`
    )
    .then(result => {
      this._measuresSubject.next(result);
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._measuresSubject.next([]);
    });
    return this._measuresSubject;
  }

  fetchSamples(measureId) {
    return this._db.query(
      `SELECT * FROM samples
      WHERE "measureId"=${Influx.escape.stringLit(measureId)};`
    , { precision: Influx.Precision.Milliseconds })
    .catch(err => {
      this._errorsSubject.next(err);
    });
  }

  insertExperiment(experiment) {
    const points = [{
      measurement: 'experiments',
      tags: { id: uuidv4() },
      fields: {
        reference: experiment.reference,
        name: experiment.name,
        bench: JSON.stringify(experiment.bench),
        campaign: JSON.stringify(experiment.campaign),
        isLocal: experiment.isLocal,
        beginTime: dateToTimestamp(experiment.beginTime),
        endTime: dateToTimestamp(experiment.endTime)
      }
    }];

    return this._db.writePoints(points)
    .then(() => {
      return points[0].tags.id;
    })
    .catch(err => {
      this._errorsSubject.next(err);
    });
  }

  insertMeasures(experimentId, measures) {
    const points = measures.map(measure => ({
      measurement: 'measures',
      tags: { id: uuidv4(), experimentId },
      fields: {
        name: measure.name,
        type: measure.type,
        unit: measure.unit
      }
    }));

    return this._db.writePoints(points)
    .then(() => {
      return points.map(point => point.tags.id);
    })
    .catch(err => {
      this._errorsSubject.next(err);
    });
  }

  insertSamples(samples, date = new Date()) {
    const points = samples.map(sample => ({
      measurement: 'samples',
      tags: { id: uuidv4(), measureId: sample.measure },
      fields: {
        value: sample.value,
      },
      timestamp: timeToTimestamp(sample.date, date)
    }));

    return this._db.writePoints(points, { precision: Influx.Precision.Milliseconds })
    .then(() => {
      return points.map(point => point.fields);
    })
    .catch(err => {
      this._errorsSubject.next(err);
    });
  }

  removeExperiment(id) {
    return this._db.query(`DELETE from experiments WHERE "id"=${Influx.escape.stringLit(id)};`)
    .catch(err => {
      this._errorsSubject.next(err);
    });
  }

  async changes() {
    return {
      local: [],
      remote: [],
      length: 0
    }
  }

  install() {
    return this._db.getDatabaseNames()
    .then(names => {
      if (!names.includes(DATABASE_NAME)) {
        return this._db.createDatabase(DATABASE_NAME);
      }
    })
    .catch(err => {
      this._errorsSubject.next(err);
    });
  }

  drop() {
    return this._db.dropDatabase(DATABASE_NAME)
    .catch(err => {
      this._errorsSubject.next(err);
    });
  }

  getCurrent() {
    return 'remote';
  }

  getLimit() {
    return LIMIT;
  }
}

let _Vue;

export default Vue => {
  if (_Vue === Vue) return;
  _Vue = Vue;

  Vue.mixin({
    beforeCreate () {
      if (this.$options.router) {
        this._db = new Database();
      } else if (this.$options.parent && this.$options.parent._db) {
        this._db = this.$options.parent._db;
      }
    }
  });

  Object.defineProperty(Vue.prototype, '$db', {
    get () { return this._db; }
  });
};
