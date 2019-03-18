import PouchDB from 'pouchdb';
import { BehaviorSubject } from 'rxjs';

const REMOTE = 'http://localhost:5984/safran';
const LOCAL = 'safran';

const DBLocal = new PouchDB(LOCAL);
const DBRemote = new PouchDB(REMOTE);

const Experiments = new BehaviorSubject([]);
const Experiment = new BehaviorSubject({});

let PENDING = [];

export const fetchExperiments = options => {
  DBLocal.allDocs({ include_docs: true, ...options })
    .then(docs => {
      Experiments.next(docs);
    });

  return Experiments;
};

export const fetchExperiment = id => {
  DBLocal.get(id)
    .then(doc => Experiment.next(doc))
    .catch(() => {
      PENDING.push(fetchExperiment.bind(this, id));
    });

  return Experiment;
};

export const deleteExperiment = async doc => {
  await DBLocal.remove(doc);
};

const fetchPending = () => {
  for (let pending of PENDING) {
    pending();
  }
  PENDING = [];
};

export const getLastSync = db => {
  const key = db === 'local' ? 'localLastSync' : 'remoteLastSync';
  const lastSync = localStorage.getItem(key);
  return lastSync && lastSync !== '0' ? lastSync : 0;
};

export const setLastSync = (db, lastSync) => {
  const key = db === 'local' ? 'localLastSync' : 'remoteLastSync';
  localStorage.setItem(key, lastSync);
};

export const localChanges = async () => {
  return await DBLocal.changes({
    since: getLastSync('local'),
    include_docs: true
  });
};

export const remoteChanges = async () => {
  return await DBRemote.changes({
    since: getLastSync('remote'),
    include_docs: true
  });
};

export const sync = (localLastSync, remoteLastSync) => {
  setLastSync('local', localLastSync);
  setLastSync('remote', remoteLastSync);

  DBLocal.sync(DBRemote)
    .then(() => {
      fetchExperiments();
      fetchPending();
    });
};

export const removeLocal = () => {
  setLastSync('local', 0);
  setLastSync('remote', 0);
  DBLocal.destroy();
  window.location = '/';
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
