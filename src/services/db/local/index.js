import PouchDB from 'pouchdb';
import { DESIGNS, DESIGNS_MAPPER } from './schema';
import { loading$, error$ } from '../subjects';

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
    promises = [];

    return db;
  };
};

let fetchDB = setup();

const execute = async requestDB => {
  loading$.next(true);
  try {
    const db = await fetchDB();
  return await requestDB(db);
  } catch (err) {
    error$.next(err);
  } finally {
    loading$.next(false);
  }
};

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

let memoizeConfig = null;
export const fetchConfig = async () => {
  if (memoizeConfig === null) {
    memoizeConfig = await execute(db => db.get('config'));
  }
  return memoizeConfig;
};

export const fetchPlugin = async id => await execute(db => db.get(id));

export const fetchPlugins = async () => {
  const plugins = await execute(db => db.query('plugins/findAll', { include_docs: true }));

  return plugins.rows.map((row, index) => ({
    ...row.doc,
    i: index,
    static: true
  }));
};

export const fetchModifications = async experimentId => {
  return await execute(async db => {
    const modifications = await db.query('modifications/findByExperiment', { key: experimentId, include_docs: true });
    return modifications.rows.map(row => row.doc);
  });
};

export const insertPlugin = async plugin => {
  const doc = {
    ...plugin,
    type: 'plugin',
    x: 0,
    y: 0,
    w: 2,
    h: 8,
  };

  return await execute(async db => {
    const plugin = await db.post(doc);
    doc._id = plugin.id;
    doc._rev = plugin.rev;
    return doc;
  });
};

export const insertModification = async modification => {
  const doc = {
    ...modification,
    type: 'modification'
  };

  return await execute(async db => {
    const modification = await db.post(doc);
    doc._id = modification.id;
    doc._rev = modification.rev;
    return doc;
  });
};

export const updateConfig = async config => {
  memoizeConfig = null;
  return await execute(db => db.put(config));
};

export const updatePlugin = async plugin => {
  return await execute(async db => {
    const doc = await db.put(plugin);
    plugin._id = doc.id;
    plugin._rev = doc.rev;
    return plugin;
  });
};

export const removeModification = async modification => {
  return await execute(async db => {
    return await db.remove(modification._id, modification._rev);
  });
};

export const installDB = async () => {
  fetchDB = setup();
  await execute(() => {});
};

export const dropDB = async () => await execute(db => db.destroy());
