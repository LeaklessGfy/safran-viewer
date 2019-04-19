import PouchDB from 'pouchdb';
import uuidv4 from 'uuid/v4';
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

  fetchModifications(experimentId) {
    this._loadingSubject.next(true);
    return this._db.query('modifications/findByExperiment', {
      key: experimentId,
      include_docs: true
    })
    .then(values => {
      return values.rows.map(row => row.doc);
    })
    .catch(err => {
      this._errorsSubject.next(err);
      throw err;
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
  }

  insertModification(modification, experiment) {
    const doc = {
      id: uuidv4(),
      typeX: 'modification',
      experimentId: modification.experimentId,
      measure: modification.measure,
      startDate: timeToTimestamp(modification.startTime, experiment.beginTime),
      endDate: timeToTimestamp(modification.endTime, experiment.endTime),
      operation: modification.operation,
      value: parseInt(modification.value, 10),
      isApply: false,
      isLoad: false
    };
    return this._insertDoc(doc)
    .then(result => {
      doc._id = result.id;
      doc._rev = result.rev;
      return doc;
    });
  }

  removeModification(modification) {
   return this._db.remove(modification)
   .then(result => {
     if (!result.ok) {
       throw new Error('Error while removing');
     }
     return result;
   })
   .catch(err => {
     this._errorsSubject.next(err);
     throw err;
   });
  }

  insertProtocols(protocols) {
    this._insertDoc(protocols);
  }

  openDatabase() {
    this._db = new PouchDB(DATABASE_NAME, {
      auto_compaction: true
    });
    return Promise.resolve();
  }

  install() {
    this.openDatabase();
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
      return err;
    }
  }

  async _insertMultipleDocs(docs) {
    try {
      return await this._db.bulkDocs(docs);
    } catch (err) {
      this._errorsSubject.next(err);
      return err;
    }
  }
}
