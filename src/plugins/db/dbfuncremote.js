import * as Influx from 'influx';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { concatMap, filter, withLatestFrom  } from 'rxjs/operators';
import { config$ } from './dbfunclocal';
import Schema from './influxdb/schema';

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

const remoteDB = () => {
  let db = null;
  let cg = null;

  return async (request, config) => {
    if (cg === config) {
      return await request(db);
    }

    console.log('long running');
    db = new Influx.InfluxDB({
      host: config.host,
      port: config.port,
      protocol: config.protocol,
      database: DATABASE_NAME,
      schema: Schema
    });
    await pingDB(db);
    await installDB(db);
    cg = config;

    return await request(db);
  };
};

const db$ = remoteDB();
const requests$ = new ReplaySubject(10);

const sub$ = requests$.pipe(
  filter(val => val),
  withLatestFrom(config$.pipe(filter(val => val))),
  concatMap(([request, config]) => db$(request, config))
);

// fetch Smth
requests$.next(async db => {
  const values = await db.query('SELECT DISTINCT(bench) FROM experiments;');
  return values.map(value => value.distinct);
});
requests$.next(async db => db + 2);

sub$.subscribe(val => {
  val();
}, err => {
  console.log(err);
});

sub$.next(async v => v);

