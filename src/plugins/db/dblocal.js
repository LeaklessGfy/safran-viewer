import PouchDB from 'pouchdb';
import { DESIGNS, DESIGNS_MAPPER } from './couchdb/schema';

const DATABASE_NAME = 'safran_db';

const installDB = async db => {
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

const fetchDB = (() => {
  const db = new PouchDB(DATABASE_NAME, { auto_compaction: true });
  let promises = [];

  return async () => {
    if (db !== null) {
      await Promise.all(promises);
      return db;
    }
    promises = [installDB(db)];
    await Promise.all(promises);

    return db;
  };
})();

const execute = async requestDB => {
  const db = await fetchDB();
  return await requestDB(db);
};

let config = null;
export const fetchConfig = async () => {
  if (config === null) {
    config = await execute(db => db.get('config'));
  }
  return config;
};
