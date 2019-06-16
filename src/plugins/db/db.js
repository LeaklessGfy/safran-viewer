import { Subject, BehaviorSubject } from 'rxjs';
import LocalDB from './couchdb/db';
import RemoteDB from './influxdb/db';

let INSTANCE = null;

const createDatabases = async () => {
  const local = new LocalDB();
  await local.init();

  const remote = new RemoteDB();
  await remote.init();

  return { local, remote };
};

export const getDatabases = async () => {
  if (!INSTANCE) {
    INSTANCE = await createDatabases();
  }
  return INSTANCE;
};

class DBHandler {
  _local;
  _remote;

  _errorsSubject;
  _loadingSubject;

  constructor() {
    this._errorsSubject = new Subject();
    this._loadingSubject = new BehaviorSubject(false);

    this._local = new LocalDB(this._errorsSubject, this._loadingSubject);
    this._remote = new RemoteDB(this._errorsSubject, this._loadingSubject, this._local);
  }

  getErrors() {
    return this._errorsSubject;
  }

  getLoading() {
    return this._loadingSubject;
  }

  getLocal() {
    return this._local;
  }

  getRemote() {
    return this._remote;
  }
}

export const DB = new Proxy(new DBHandler(), {
  get: function(target, name) {
    if (target[name]) {
      return target[name];
    }
    if (target._remote[name]) {
      return target._remote[name].bind(target._remote);
    }
    if (target._local[name]) {
      return target._local[name].bind(target._local);
    }
    throw new Error('Unknown method ' + name);
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
