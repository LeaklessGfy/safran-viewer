import { Subject, BehaviorSubject } from 'rxjs';
import LocalDB from './couchdb/db';
import RemoteDB from './influxdb/db';

class DBHandler {
  _current;
  _local;
  _remote;

  /* SUBJECTS */
  _errorsSubject;
  _loadingSubject;
  _experimentSubject;
  _experimentsSubject;
  _benchsSubject;
  _campaignsSubject;
  _measuresSubject;

  constructor() {
    /* SUBJECTS */
    this._errorsSubject = new Subject();
    this._loadingSubject = new BehaviorSubject(false);
    this._experimentSubject = new BehaviorSubject({});
    this._experimentsSubject = new BehaviorSubject([]);
    this._benchsSubject = new BehaviorSubject([]);
    this._campaignsSubject = new BehaviorSubject([]);
    this._measuresSubject = new BehaviorSubject([]);

    /* DB */
    this._local = new LocalDB(
      this._errorsSubject, this._loadingSubject, this._experimentSubject, this._experimentsSubject,
      this._benchsSubject, this._campaignsSubject, this._measuresSubject
    );
    this._remote = new RemoteDB(
      this._errorsSubject, this._loadingSubject, this._experimentSubject, this._experimentsSubject,
      this._benchsSubject, this._campaignsSubject, this._measuresSubject
    );

    this._current = this._remote;
  }

  getErrors() {
    return this._errorsSubject;
  }

  getLoading() {
    return this._loadingSubject;
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

  change() {
    this._current = this.getAlternate();
  }

  isLocal() {
    return this._current === this._local;
  }

  isRemote() {
    return this._current === this._remote;
  }

  getAlternate() {
    return this.isLocal() ? this._remote : this._local;
  }

  getDBString() {
    return this.isLocal() ? 'local' : 'remote';
  }

  getLocal() {
    return this._local;
  }

  getRemote() {
    return this._remote;
  }
}

const DB = new Proxy(new DBHandler(), {
  get: function(target, name) {
    if (!target[name]) {
      return target._current[name];
    }
    return target[name];
  }
});

let _Vue;
export default Vue => {
  if (_Vue === Vue) return;
  _Vue = Vue;

  Object.defineProperty(Vue.prototype, '$db', {
    get () { return DB; }
  });
};
