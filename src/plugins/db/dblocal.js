import PouchDB from 'pouchdb';
import { DESIGNS, DESIGNS_MAPPER } from './couchdb/schema';

const DATABASE_NAME = 'safran_db';

const setup = () => {
  let db = null;
  let promises = [];

  return async () => {
    if (db !== null) {
      await Promise.all(promises);
      return db;
    }

    db = new PouchDB(DATABASE_NAME, { auto_compaction: true });
    promises = [installDBRequest(db)];
    await Promise.all(promises);

    return db;
  };
};

let fetchDB = setup();

const installDBRequest = async db => {
  const values = await db.bulkGet({ docs: DESIGNS });
  for (let result of values.results) {
    for (let doc of result.docs) {
      if (doc.ok) {
        db.remove(doc.ok._id, doc.ok._rev);
      }
    }
    db.put(DESIGNS_MAPPER[result.id]);
  }
};


const execute = async requestDB => {
  const db = await fetchDB();
  return await requestDB(db);
};

let memoizeConfig = null;
export const fetchConfig = async () => {
  if (memoizeConfig === null) {
    memoizeConfig = await execute(db => db.get('config'));
  }
  return memoizeConfig;
};

export const fetchPlugin = async id => await execute(db => db.query('plugins/findAll', { key: id, include_docs: true}));

export const fetchPlugins = async () => {
  const plugins = await execute(db => db.query('plugins/findAll', { include_docs: true}));

  return plugins.rows.map((row, index) => ({
    ...row.doc,
    i: index,
    static: true
  }));
};

export const updateConfig = async config => {
  memoizeConfig = null;
  return await execute(db => db.put(config));
};

export const installDB = async () => {
  fetchDB = setup();
  await execute(installDBRequest);
};

export const dropDB = async () => await execute(db => db.destroy());
