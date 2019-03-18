import PouchDB from 'pouchdb';
import { BehaviorSubject } from "rxjs";

const REMOTE = 'http://localhost:5984/experiments';
const LOCAL = 'experiments';

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
}

export const fetchExperiment = id => {
  DBLocal.get(id)
    .then(doc => Experiment.next(doc))
    .catch(() => {
      PENDING.push(fetchExperiment.bind(this, id));
    });

  return Experiment;
}

export const deleteExperiment = async doc => {
  await DBLocal.remove(doc);
}

const fetchPending = () => {
  for (let pending of PENDING) {
    pending();
  }
  PENDING = [];
}

export const Sync = () => {
  DBLocal.sync(DBRemote)
    .then(() => {
      fetchExperiments();
      fetchPending();
    });
}

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
