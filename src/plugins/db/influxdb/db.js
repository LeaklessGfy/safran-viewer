import * as Influx from 'influx';
import uuidv4 from 'uuid/v4';
import { subSeconds } from 'date-fns';
import { BehaviorSubject, from, iif, of, concat } from 'rxjs';
import { mergeMap  } from 'rxjs/operators';
import Schema from './schema';
import { dateToTimestamp, timeToTimestamp, stringToDate, dateToISO } from '@/services/date';

const DATABASE_NAME = 'safran_db';

let test = null;

export default class Database {
  _db;
  _localDB;
  _config;

  /* SUBJECTS */
  _errorsSubject;
  _loadingSubject;

  constructor(errors, loading, localDB) {
    this._errorsSubject = errors;
    this._loadingSubject = loading;
    this._localDB = localDB;
    this._config = {
      host: 'localhost',
      port: 8086,
      protocol: 'http',
      limit: 5
    };

    const bh = new BehaviorSubject();
    const sub = bh.pipe(
      mergeMap(request => 
        iif(() => {
          console.log('test', test);
          return test === null;
        },
          from(new Promise(r => {
            setTimeout(() => {
              test = 1;
              r(test);
            }, 100);
          })).pipe(mergeMap(val => from(request(val)))),
          from(request(0))
        )
      )
    );
    bh.next(async (v) => 2 + v);
    sub.subscribe(val => {
      console.log(val);
    });
    sub.next(async (v) => v);
  }

  fetchExperiment(id) {
    return this._query(
      `SELECT * FROM experiments WHERE "id"=${Influx.escape.stringLit(id)} LIMIT 1;`,
      values => {
        if (values.length < 1) {
          throw new Error('Experiment not found with id ' + id);
        }
        return {
          ...values[0],
          startDate: stringToDate(values[0].startDate),
          endDate: stringToDate(values[0].endDate)
        };
      }
    );
  }

  fetchExperiments(page = 1) {
    return this._promise(Promise.all([
      this._db.query(`SELECT * FROM experiments LIMIT ${this._config.limit} OFFSET ${(page - 1) * this._config.limit};`),
      this._db.query('SELECT count("name") FROM experiments;')
    ]), values => {
      const result = values[0].map(r => ({
        ...r,
        startDate: stringToDate(r.startDate),
        endDate: stringToDate(r.endDate)
      }));
      result.total = values[1].length > 0 ? values[1][0].count / this._config.limit : 1;
      result.current = page;
      result.limit = this._config.limit;
      return result;
    });
  }

  fetchBenchs() {
    return this._query('SELECT DISTINCT(bench) FROM experiments;', values => values.map(v => v.distinct));
  }

  fetchCampaigns() {
    return this._query('SELECT DISTINCT(campaign) FROM experiments;', values => values.map(v => v.distinct));
  }

  fetchMeasure(id) {
    return this._query(
      `SELECT * FROM measures WHERE "id"=${Influx.escape.stringLit(id)} LIMIT 1;`,
      values => {
        if (values.length < 1) {
          throw new Error('Experiment not found with id ' + id);
        }
        return values[0];
      }
    );
  }

  fetchMeasures(experimentId, page = 1) {
    return this._promise(Promise.all([
      this._db.query(
        `SELECT * FROM measures
        WHERE "experimentID"=${Influx.escape.stringLit(experimentId)}
        LIMIT ${this._config.limit}
        OFFSET ${(page - 1) * this._config.limit};`
      ),
      this._db.query(`SELECT count("name") FROM measures WHERE "experimentID"=${Influx.escape.stringLit(experimentId)};`)
    ]), values => {
      const result = values[0];
      result.total = values[1].length > 0 ? values[1][0].count / this._config.limit : 1;
      result.current = page;
      result.limit = this._config.limit;
      return result;
    });
  }

  fetchSamples(measureId) {
    return this._query(
      `SELECT * FROM samples WHERE "measureID"=${Influx.escape.stringLit(measureId)};`,
      values => {
        return values.map(value => {
          value.time = new Date(value.time.toLocaleString('en-US', { timeZone: 'UTC' }));
          return value;
        });
      }
    );
  }

  fetchSample(measureId, date) {
    return this._query(
      `SELECT first(value) FROM samples
      WHERE "measureID"=${Influx.escape.stringLit(measureId)}
      AND time >= '${dateToISO(subSeconds(date, 1))}' AND time <= '${dateToISO(date)}'
      GROUP BY time(100ms) fill(previous);`,
      values => {
        const value = values.find(value => value.first !== null);
        return value ? value.first : null;
      }
    );
  }

  fetchAlarms(experimentId) {
    return this._query(
      `SELECT * FROM alarms WHERE "experimentID"=${Influx.escape.stringLit(experimentId)};`,
      values => {
        return values.map(value => {
          value.time = new Date(value.time.toLocaleString('en-US', { timeZone: 'UTC' }));
          return value;
        });
      }
    );
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

    return this._promise(this._db.writePoints(points), () => points[0].tags.id);
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

    return this._promise(this._db.writePoints(points), () => points.map(point => point.tags.id));
  }

  insertSamples(experimentId, samples, date = new Date()) {
    const points = samples.map(sample => ({
      measurement: 'samples',
      tags: { experimentId, measureId: sample.measure },
      fields: {
        value: sample.value,
      },
      timestamp: timeToTimestamp(sample.time, date)
    }));

    return this._promise(this._db.writePoints(points, { precision: Influx.Precision.Milliseconds }));
  }

  insertAlarms(experimentId, alarms, date = new Date()) {
    const points = alarms.map(alarm => ({
      measurement: 'alarms',
      tags: { experimentId },
      fields: {
        level: alarm.level,
        message: alarm.message
      },
      timestamp: timeToTimestamp(alarm.time, date)
    }));

    return this._promise(this._db.writePoints(points, { precision: Influx.Precision.Milliseconds }));
  }

  removeExperiment(id) {
    return this._promise(Promise.all([
      this._db.query(`DELETE FROM experiments WHERE "id"=${Influx.escape.stringLit(id)};`),
      this._db.query(`DELETE FROM measures WHERE "experimentID"=${Influx.escape.stringLit(id)};`),
      this._db.query(`DELETE FROM samples WHERE "experimentID"=${Influx.escape.stringLit(id)};`),
      this._db.query(`DELETE FROM alarms WHERE "experimentID"=${Influx.escape.stringLit(id)};`)
    ]));
  }

  initConfig() {
    return this._localDB.fetchConfig()
    .then(config => this._config = config ? config : this._config)
    .then(() => this.openDatabase())
    .then(() => this.install());
  }

  openDatabase() {
    this._db = new Influx.InfluxDB({
      host: this._config.host,
      port: this._config.port,
      protocol: this._config.protocol,
      database: DATABASE_NAME,
      schema: Schema
    });

    return this._promise(this._db.ping(5000), hosts => {
      const hasSucceed = hosts.every(host => host.online);
      if (!hasSucceed) {
        throw new Error('Host not online : ' + this._config.protocol + '://' + this._config.host + ':' + this._config.port);
      }
    });
  }

  install() {
    return this._promise(this._db.getDatabaseNames(), names => {
      if (!names.includes(DATABASE_NAME)) {
        return this._db.createDatabase(DATABASE_NAME);
      }
    });
  }

  drop() {
    return this._promise(this._db.dropDatabase(DATABASE_NAME));
  }

  _query(query, mapper) {
    return this._promise(this._db.query(query, { precision: Influx.Precision.Milliseconds }), mapper);
  }

  _promise(promise, mapper) {
    this._loadingSubject.next(true);
    return promise
    .then(result => {
      return mapper ? mapper(result) : result;
    })
    .catch(err => {
      this._errorsSubject.next(err);
      throw err;
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
  }
}
