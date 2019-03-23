import PouchDB from 'pouchdb';
import { Subject, BehaviorSubject } from 'rxjs';
import Experiment from './models/experiment';
import { BULK_DESIGNS, MAPPER_DESIGNS } from './designs';

const LOCAL_DB_NAME = 'safran';
const REMOTE_DB_NAME = 'http://localhost:5984/safran';

const LOCAL = 'local';
const REMOTE = 'remote';

const LOCAL_SYNC_KEY = 'safran:local:last_sync';
const REMOTE_SYNC_KEY = 'safran:remote:last_sync';
const REMOTE_DB_NAME_KEY = 'safran:remote:db_name';
const DEFAULT_DB_KEY = 'safran:default:db';

const LIMIT = 6;

class Database {
  _router;
  _dbLocal;
  _dbRemote;
  _db;
  _errorsSubject;
  _experimentSubject;
  _experimentsSubject;
  _benchsSubject;
  _campaignsSubject;
  _dbSubject;
  _remoteNameSubject;
  _pendings;
  Experiment = Experiment;

  constructor(router) {
    this._router = router;
    this._openDatabases();
    this._db = this._getDefaultDb();
    this._errorsSubject = new Subject();
    this._experimentSubject = new BehaviorSubject({});
    this._experimentsSubject = new BehaviorSubject([]);
    this._benchsSubject = new BehaviorSubject([]);
    this._campaignsSubject = new BehaviorSubject([]);
    this._measuresSubject = new BehaviorSubject([]);
    this._dbSubject = new BehaviorSubject(this.getCurrent());
    this._remoteNameSubject = new BehaviorSubject(this.getRemoteDbName());
    this._pendings = {
      experiment: null
    };
  }

  fetchErrors() {
    return this._errorsSubject;
  }

  fetchExperiment(id) {
    this._setPending('experiment', this.fetchExperiment.bind(this, id));
    this._db.get(id)
    .then(doc => this._experimentSubject.next(doc))
    .catch(err => {
      this._errorsSubject.next(err);
      this._experimentSubject.next({});
    });
    return this._experimentSubject;
  }

  fetchExperiments(page = 1) {
    this._db.query('experiments/findAll', {
      include_docs: true,
      limit: LIMIT,
      skip: LIMIT * (page - 1)
    })
    .then(docs => this._experimentsSubject.next(docs))
    .catch(err => {
      this._errorsSubject.next(err);
      this._experimentsSubject.next([]);
    });
    return this._experimentsSubject;
  }

  fetchBenchs() {
    this._db.query('benchs/findAll', { group: true })
    .then(docs => this._benchsSubject.next(docs))
    .catch(err => {
      this._errorsSubject.next(err);
      this._benchsSubject.next([]);
    });
    return this._benchsSubject;
  }

  fetchCampaigns() {
    this._db.query('campaigns/findAll', { group: true })
    .then(docs => this._campaignsSubject.next(docs))
    .catch(err => {
      this._errorsSubject.next(err);
      this._campaignsSubject.next([]);
    });
    return this._campaignsSubject;
  }

  fetchMeasures(id, page = 1) {
    this._db.query('measures/findAll', {
      key: id,
      limit: LIMIT,
      skip: LIMIT * (page - 1)
    })
    .then(docs => this._measuresSubject.next(docs))
    .catch(err => {
      this._errorsSubject.next(err);
      this._measuresSubject.next([]);
    });
    return this._measuresSubject;
  }

  fetchMeasure(id) {
    return this._db.get(id)
    .catch(err => {
      this._errorsSubject.next(err);
    });
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

  fetchRemoteDbName() {
    this._remoteNameSubject.next(this.getRemoteDbName());
    return this._remoteNameSubject;
  }

  async insertDoc(doc) {
    try {
      return await this._db.post(doc);
    } catch (err) {
      this._errorsSubject.next(err);
      return null;
    }
  }

  async insertMultipleDocs(docs) {
    try {
      return await this._db.bulkDocs(docs);
    } catch (err) {
      this._errorsSubject.next(err);
      return null;
    }
  }

  async editExperiment(_rev, experiment) {
    try {
      await this._db.put({
        _rev,
        ...experiment
      });
      return true;
    } catch (err) {
      this._errorsSubject.next(err);
      return false;
    }
  }

  async deleteExperiment(doc) {
    await this._db.remove(doc);
  }

  async changes() {
    try {
      const local = await this._dbLocal.changes({
        since: parseInt(this._getLastSync(LOCAL), 10),
        limit: LIMIT,
        include_docs: true
      });
      const remote = await this._dbRemote.changes({
        since: this._getLastSync(REMOTE),
        limit: LIMIT,
        include_docs: true
      });

      return {
        local,
        remote,
        length: local.results.length + remote.results.length
      };
    } catch (err) {
      this._errorsSubject.next(err);
      return {
        local: [],
        remote: [],
        length: 0
      }
    }
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

  async install() {
    try {
      const bulkGet = await this._db.bulkGet({ docs: BULK_DESIGNS });

      for (let result of bulkGet.results) {
        for (let doc of result.docs) {
          if (doc.ok && doc.ok.views && Object.keys(doc.ok.views).length > 0) {
            await this._db.remove(doc.ok._id, doc.ok._rev);
          }
        }
        const put = await this._db.put(MAPPER_DESIGNS[result.id]);
        if (!put.ok) {
          throw new Error('Error with install of ' + result.id);
        }
      }

      return this.getCurrent();
    } catch (err) {
      this._errorsSubject.next(err);
    }
  }

  async remove() {
    this._setLastSync(LOCAL, 0);
    this._setLastSync(REMOTE, 0);
    await this._db.destroy();
    this._openDatabases();
    return this.getCurrent();
  }

  async compact() {
    try {
      await this._db.compact();
      await this._db.viewCleanup();
      return this.getCurrent();
    } catch (err) {
      this._errorsSubject.next(err);
    }
  }

  getCurrent() {
    return this._db === this._dbLocal ? LOCAL : REMOTE;
  }

  getLimit() {
    return LIMIT;
  }

  getRemoteDbName() {
    const dbName = localStorage.getItem(REMOTE_DB_NAME_KEY);
    return dbName ? dbName : REMOTE_DB_NAME;
  }

  setRemoteDbName(dbName) {
    localStorage.setItem(REMOTE_DB_NAME_KEY, dbName ? dbName : REMOTE_DB_NAME);
    this.fetchRemoteDbName();
    this._openDatabases();
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
    this.fetchCurrentDb();
    switch (this._router.currentRoute.name) {
      case 'home':
        this.fetchExperiments();
        break;
      case 'experiment':
        this.fetchPendings();
        break;
      case 'protocol':
        break;
      case 'import':
        this.fetchBenchs();
        this.fetchCampaigns();
        break;
      case 'config':
        break;
    }
  }

  _setPending(subject, callback) {
    this._pendings[subject] = callback;
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
  
  _openDatabases() {
    this._dbLocal = new PouchDB(LOCAL_DB_NAME, {
      auto_compaction: true
    });
    this._dbRemote = new PouchDB(this.getRemoteDbName(), {
      auth: { username: 'adm', password: 'pass' },
      auto_compaction: true
    });
    this._db = this._getDefaultDb();
  }
}

let _Vue;

export default Vue => {
  if (_Vue === Vue) return;
  _Vue = Vue;

  Vue.mixin({
    beforeCreate () {
      if (this.$options.router) {
        this._db = new Database(this.$options.router);
      } else if (this.$options.parent && this.$options.parent._db) {
        this._db = this.$options.parent._db;
      }
    }
  });

  Object.defineProperty(Vue.prototype, '$db', {
    get () { return this._db; }
  });
};

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
