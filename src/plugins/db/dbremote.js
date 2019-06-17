import * as Influx from 'influx';
import Schema from './influxdb/schema';
import { fetchConfig } from './dblocal';

const DATABASE_NAME = 'safran_db';

const pingDB = async db => {
  const hosts = await db.ping(500);
  const hasSucceed = hosts.every(host => host.online);
  if (!hasSucceed) {
    throw new Error('Host not online');
  }
};

const installDB = async db => {
  const databaseNames = await db.getDatabaseNames();
  if (!databaseNames.includes(DATABASE_NAME)) {
    await db.createDatabase(DATABASE_NAME);
  }
};

const fetchDB = (() => {
  let db = null;
  let cg = null;
  let promises = [];

  return async config => {
    if (cg === config) {
      return db;
    }
    if (db !== null) {
      await Promise.all(promises);
      return db;
    }
    db = new Influx.InfluxDB({
      host: config.host,
      port: config.port,
      protocol: config.protocol,
      database: DATABASE_NAME,
      schema: Schema
    });

    promises = [pingDB(db), installDB(db)];
    await Promise.all(promises);
    cg = config;

    return db;
  };
})();

const execute = async requestDB => {
  const config = await fetchConfig();
  const db = await fetchDB(config);
  return await requestDB(db, config);
};

export const fetchExperiment = async (id) => {
  const results = await execute(db => db.query(`SELECT * FROM experiments WHERE "id"=${Influx.escape.stringLit(id)} LIMIT 1;`));
  if (results.length < 1) {
    throw new Error('Experiment not found with id ' + id);
  }
  return results[0];
};

export const fetchExperiments = async (page = 1) => {
  const [ experiments, { total, limit } ] = await Promise.all(
    execute(async (db, cg) => db.query(`SELECT * FROM experiments LIMIT ${cg.limit} OFFSET ${(page - 1) * cg.limit};`)),
    execute(async (db, cg) => {
      const r = await db.query('SELECT count("name") FROM experiments;');
      return { total: r.length > 0 ? r[0].count % cg.limit : 1, limit: cg.limit };
    })
  );

  const result = experiments.map(r => ({ ...r }));
  result.total = total;
  result.current = page;
  result.limit = limit;

  return result;
};

export const fetchBenchs = async () => {
  const results = await execute(db => db.query('SELECT DISTINCT(bench) FROM experiments;'));
  return results.map(r => r.distinct);
};

export const fetchCampaigns = async () => {
  const results = await execute(db => db.query('SELECT DISTINCT(campaign) FROM experiments;'));
  return results.map(r => r.distinct);
};

export const fetchMeasure = async id => {
  const results = await execute(db => db.query(`SELECT * FROM measures WHERE "id"=${Influx.escape.stringLit(id)} LIMIT 1;`));
  if (!results.length < 1) {
    throw new Error('Measure not found with id ' + id);
  }
  return results[0];
};

export const fetchMeasures = async (experimentId, page = 1) => {
  const [ measures, { total, limit } ] = await Promise.all(
    execute((db, cg) => db.query(
      `SELECT * FROM measures WHERE "experimentID"=${Influx.escape.stringLit(experimentId)}
      LIMIT ${cg.limit} OFFSET ${(page - 1) * cg.limit};`
      )
    ),
    execute(async (db, cg) => {
      const r = await db.query(`SELECT count("name") FROM measures WHERE "experimentID"=${Influx.escape.stringLit(experimentId)};`);
      return { total: r.length > 0 ? r[0].count % cg.limit : 1, limit: cg.limit };
    })
  );
  
  const result = measures.map(r => ({ ...r }));
  result.total = total;
  result.current = page;
  result.limit = limit;

  return result;
};
