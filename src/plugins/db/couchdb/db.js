import PouchDB from 'pouchdb';
import { DESIGNS, DESIGNS_MAPPER } from './schema';
import { timeToTimestamp } from '@/services/date';

const DATABASE_NAME = 'safran_db';

export default class Database {
  _db;

  /* SUBJECTS */
  _errorsSubject;
  _loadingSubject;

  constructor(errors, loading) {
    this._errorsSubject = errors;
    this._loadingSubject = loading;
    this.install();
  }

  fetchConfig() {
    return this._promise(this._db.get('config'));
  }

  updateConfig(config) {
    return this._promise(this._db.put(config));
  }

  fetchPlugins() {
    return this._promise(
      this._db.query('plugins/findAll', {
        include_docs: true
      }),
      values => values.rows.map((row, index) => ({
        ...row.doc,
        i: index,
        static: true
      }))
    );
  }

  fetchPlugin(id) {
    return this._promise(
      this._db.query('plugins/findAll', {
        key: id,
        include_docs: true
      })
    );
  }

  insertPlugin(plugin) {
    const doc = {
      type: 'plugin',
      x: 0,
      y: 0,
      w: 2,
      h: 8,
      experiment: plugin.experiment,
      measures: plugin.measures,
      component: plugin.component
    };
    return this._promise(this._db.post(doc), values => {
      doc._id = values.id;
      doc._rev = values.rev;
      return doc;
    });
  }

  updatePlugin(plugin) {
    return this._promise(this._db.put(plugin));
  }

  fetchModifications(experimentId) {
    return this._promise(
      this._db.query('modifications/findByExperiment', {
        key: experimentId,
        include_docs: true
      }),
      values => values.rows.map(row => row.doc)
    );
  }

  insertModification(modification, experiment) {
    const doc = {
      type: 'modification',
      experimentId: modification.experimentId,
      measure: modification.measure,
      startDate: timeToTimestamp(modification.startTime, experiment.beginTime),
      endDate: timeToTimestamp(modification.endTime, experiment.endTime),
      operation: modification.operation,
      value: parseInt(modification.value, 10),
      isApply: false,
      isLoad: false
    };
    return this._promise(this._db.post(doc), values => {
      doc._id = values.id;
      doc._rev = values.rev;
      return doc;
    });
  }

  removeModification(modification) {
    return this._promise(
      this._db.remove(modification),
      values => {
        if (!values.ok) {
          throw new Error('Error while removing');
        }
        return values;
      }
    );
  }

  fetchProtocols() {
    return this._promise(
      this._db.query('protocols/findAll', { include_docs: true }),
      values => values.rows.map(row => row.doc)
    );
  }

  insertProtocols() {
    //this._db.post(protocols);
  }

  openDatabase() {
    this._db = new PouchDB(DATABASE_NAME, {
      auto_compaction: true
    });
  }

  install() {
    this.openDatabase();

    return this._promise(this._db.bulkGet({ docs: DESIGNS }), values => {
      for (let result of values.results) {
        for (let doc of result.docs) {
          if (doc.ok) {
            this._db.remove(doc.ok._id, doc.ok._rev);
          }
        }
        this._db.put(DESIGNS_MAPPER[result.id]);
      }
    });
  }

  drop() {
    return this._promise(this._db.destroy());
  }

  _promise(promise, mapper) {
    this._loadingSubject.next(true);
    return promise
    .then(values => {
      return mapper ? mapper(values) : values;
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
