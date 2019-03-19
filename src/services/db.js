import PouchDB from 'pouchdb';
import { BehaviorSubject } from 'rxjs';

const LOCAL_DB_NAME = 'safran';
const REMOTE_DB_NAME = 'http://localhost:5984/safran';

const LOCAL = 'local';
const REMOTE = 'remote';

const LOCAL_SYNC_KEY = 'safran:local:last_sync';
const REMOTE_SYNC_KEY = 'safran:remote:last_sync';
const DEFAULT_DB_KEY = 'safran:default:db';

class Database {
  _dbLocal;
  _dbRemote;
  _db;
  _experimentSubject;
  _experimentsSubject;
  _dbSubject;
  _pendings;

  constructor() {
    this._dbLocal = new PouchDB(LOCAL_DB_NAME);
    this._dbRemote = new PouchDB(REMOTE_DB_NAME);
    this._db = this._getDefaultDb();
    this._experimentSubject = new BehaviorSubject({});
    this._experimentsSubject = new BehaviorSubject([]);
    this._dbSubject = new BehaviorSubject(this.getCurrent());
    this._pendings = {
      experiment: null
    };
  }

  fetchExperiments(opt) {
    this._db.allDocs({ include_docs: true, ...opt })
    .then(docs => this._experimentsSubject.next(docs));
    return this._experimentsSubject;
  }

  fetchExperiment(id) {
    this._pendings.experiment = this.fetchExperiment.bind(this, id);
    this._db.get(id)
    .then(doc => this._experimentSubject.next(doc))
    .catch(err => this._experimentSubject.error(err));
    return this._experimentSubject;
  }

  fetchPendings() {
    for (let pending of Object.values(this._pendings)) {
      if (pending) {
        pending();
      }
    }
  }

  fetchCurrentDb() {
    this._dbSubject.next(this.getCurrent());
    return this._dbSubject;
  }

  async deleteExperiment(doc) {
    await this._db.remove(doc);
  }

  async changes() {
    const local = await this._dbLocal.changes({
      since: parseInt(this._getLastSync(LOCAL), 10),
      include_docs: true
    });

    const remote = await this._dbRemote.changes({
      since: this._getLastSync(REMOTE),
      include_docs: true
    });

    return {
      local,
      remote,
      length: local.results.length + remote.results.length
    };
  }

  async sync(changes) {
    if (changes.length < 1) {
      return;
    }
    this._setLastSync(LOCAL, changes.local.last_seq);
    this._setLastSync(REMOTE, changes.remote.last_seq);
    await this._db.sync(this._getSyncDB());
    this._updateSubjects();
  }

  async remove() {
    this._setLastSync(LOCAL, 0);
    this._setLastSync(REMOTE, 0);
    await this._db.destroy();
    window.location = '/';
  }

  getCurrent() {
    return this._db === this._dbLocal ? LOCAL : REMOTE;
  }

  changeDb() {
    this._db = this._getSyncDB();
    this._setDefaultDb(this.getCurrent());
    this._updateSubjects();
  }

  _getDefaultDb() {
    const def = localStorage.getItem(DEFAULT_DB_KEY);
    return def === REMOTE ? this._dbRemote : this._dbLocal;
  }

  _setDefaultDb(def) {
    localStorage.setItem(DEFAULT_DB_KEY, def);
  }

  _updateSubjects() {
    this.fetchExperiments();
    this.fetchPendings();
    this.fetchCurrentDb();
  }

  _getLastSync(dbName) {
    const lastL = localStorage.getItem(LOCAL_SYNC_KEY);
    const lastR = localStorage.getItem(REMOTE_SYNC_KEY);

    switch (dbName) {
      case LOCAL:
        return lastL ? lastL : 0;
      case REMOTE:
        return lastR ? lastR : 0;
      default:
        throw new Error('Unknown database name ' + dbName);
    }
  }

  _setLastSync(dbName, lastSync) {
    switch (dbName) {
      case LOCAL:
        return localStorage.setItem(LOCAL_SYNC_KEY, lastSync);
      case REMOTE:
        return localStorage.setItem(REMOTE_SYNC_KEY, lastSync);
      default:
        throw new Error('Unknown database name ' + dbName);
    }
  }

  _getSyncDB() {
    return this._db === this._dbLocal ? this._dbRemote : this._dbLocal;
  }
}

const Db = new Database();

export default Db;

/*
DBLocal.sync(DBRemote, {
  live: true,
  retry: true
}).on('change', function (info) {
  fetchExperiments();
}).on('paused', function (err) {
  // replication paused (e.g. replication up to date, user went offline)
}).on('active', function (info) {
  // replicate resumed (e.g. new changes replicating, user went back online)
}).on('denied', function (err) {
  // a document failed to replicate (e.g. due to permissions)
}).on('complete', function (info) {
  // handle complete
}).on('error', function (err) {
  // handle error
});
*/
