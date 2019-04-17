import PouchDB from 'pouchdb';
import uuidv4 from 'uuid/v4';
import { DESIGNS, DESIGNS_MAPPER } from './schema';

const DATABASE_NAME = 'safran_db';

export default class Database {
  _db;

  /* SUBJECTS */
  _errorsSubject;
  _loadingSubject;
  _modificationsSubject;
  _protocolsSubject;

  constructor(errors, loading, modifications, protocols) {
    this._errorsSubject = errors;
    this._loadingSubject = loading;
    this._modificationsSubject = modifications;
    this._protocolsSubject = protocols;
    this.install();
  }

  fetchModifications(experimentId) {
    this._loadingSubject.next(true);
    this._db.query('modifications/findByExperiment', {
      key: experimentId,
      include_docs: true
    })
    .then(values => {
      const result = values.rows.map(({ doc }) => ({
        measure: doc.measure,
        startTime: doc.startTime,
        endTime: doc.endTime,
        operation: doc.operation,
        value: doc.value,
        isApply: doc.isApply,
        actions: doc.actions
      }));
      this._modificationsSubject.next(result);
    })
    .catch(err => {
      this._errorsSubject.next(err);
      this._modificationsSubject.next([]);
    })
    .finally(() => {
      this._loadingSubject.next(false);
    });
    return this._modificationsSubject;
  }

  fetchProtocols() {

  }

  insertModification(experimentId, modification) {
    const doc = {
      ...modification,
      id: uuidv4(),
      experimentId,
      typeX: 'modification'
    };
    this._insertDoc(doc)
    .then(() => this.fetchModifications(experimentId));
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
