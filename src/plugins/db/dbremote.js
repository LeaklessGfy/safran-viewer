import * as Influx from 'influx';
import Schema from './influxdb/schema';
import { fetchConfig } from './dblocal';
import { loading$, error$ } from './dbsubject';

const DATABASE_NAME = 'safran_db';

const setup = () => {
  let db = null;
  let cg = null;
  let promises = [];

  return async config => {
    if (cg === config) {
      return db;
    }
    if (db !== null && cg === null) {
      try {
        await Promise.all(promises);
      } catch (ignored) {
        return null;
      }
      return db;
    }

    db = new Influx.InfluxDB({
      host: config.host,
      port: config.port,
      protocol: config.protocol,
      database: DATABASE_NAME,
      schema: Schema
    });
    promises = [pingDBRequest(db), installDBRequest(db)];
    await Promise.all(promises);
    cg = config;
    promises = [];

    return db;
  };
};

let fetchDB = setup();

const execute = async requestDB => {
  loading$.next(true);
  try {
    const config = await fetchConfig();
    const db = await fetchDB(config);
    return db ? await requestDB(db, config) : null;
  } catch (err) {
    error$.next(err);
  } finally {
    loading$.next(false);
  }
};

const pingDBRequest = async db => {
  const hosts = await db.ping(500);
  const hasSucceed = hosts.every(host => host.online);
  if (!hasSucceed) {
    throw new Error('Host not online');
  }
};

const installDBRequest = async db => {
  const databaseNames = await db.getDatabaseNames();
  if (!databaseNames.includes(DATABASE_NAME)) {
    await db.createDatabase(DATABASE_NAME);
  }
};

export const fetchExperiment = async id => {
  return await execute(async db => {
    const experiment = await db.query(`SELECT * FROM experiments WHERE "id"=${Influx.escape.stringLit(id)} LIMIT 1;`);
    if (!experiment || experiment.length < 1) {
      throw new Error('Experiment not found with id ' + id);
    }
    return experiment[0];
  });
};

export const fetchExperiments = async (page = 1) => {
  return await execute(async (db, cg) => {
    const [experiments, r] = await Promise.all([
      db.query(`SELECT * FROM experiments LIMIT ${cg.limit} OFFSET ${(page - 1) * cg.limit};`),
      db.query('SELECT count("name") FROM experiments;')
    ]);

    const result = experiments.map(r => ({ ...r }));
    result.total = r.length > 0 ? r[0].count / cg.limit : 1;
    result.current = page;
    result.limit = cg.limit;

    return result;
  });
};

export const fetchBenchs = async () => {
  return await execute(async db => {
    const benchs = await db.query('SELECT DISTINCT(bench) FROM experiments;');
    return benchs.map(r => r.distinct);
  });
};

export const fetchCampaigns = async () => {
  return await execute(async db => {
    const campaigns = await db.query('SELECT DISTINCT(campaign) FROM experiments;');
    return campaigns.map(r => r.distinct);
  });
};

export const fetchMeasure = async id => {
  return await execute(async db => {
    const measure = await db.query(`SELECT * FROM measures WHERE "id"=${Influx.escape.stringLit(id)} LIMIT 1;`);
    if (!measure || measure.length < 1) {
      throw new Error('Measure not found with id ' + id);
    }
    return measure[0];
  });
};

export const fetchMeasures = async (experimentId, page = 1) => {
  return await execute(async (db, cg) => {
    const [measures, r] = await Promise.all([
      db.query(`SELECT * FROM measures WHERE "experimentID"=${Influx.escape.stringLit(experimentId)}
      LIMIT ${cg.limit} OFFSET ${(page - 1) * cg.limit};`
      ),
      db.query(`SELECT count("name") FROM measures WHERE "experimentID"=${Influx.escape.stringLit(experimentId)};`)
    ]);

    const result = measures.map(r => ({ ...r }));
    result.total =  r.length > 0 ? r[0].count / cg.limit : 1;
    result.current = page;
    result.limit = cg.limit;

    return result;
  });
};

export const fetchSamples = async measureId => {
  return await execute(db => db.query(`SELECT * FROM samples WHERE "measureID"=${Influx.escape.stringLit(measureId)};`));
};

export const fetchAlarms = async experimentId => {
  return await execute(db => db.query(`SELECT * FROM alarms WHERE "experimentID"=${Influx.escape.stringLit(experimentId)};`));
};

export const removeExperiment = async id => {
  const query = `DELETE FROM experiments WHERE "id"=${Influx.escape.stringLit(id)};
  DELETE FROM measures WHERE "experimentID"=${Influx.escape.stringLit(id)};
  DELETE FROM samples WHERE "experimentID"=${Influx.escape.stringLit(id)};
  DELETE FROM alarms WHERE "experimentID"=${Influx.escape.stringLit(id)};`;

  return await execute(db => db.query(query));
};

export const installDB = async () => {
  fetchDB = setup();
  await execute(() => {});
};

export const dropDB = async () => await execute(db => db.dropDatabase(DATABASE_NAME));
