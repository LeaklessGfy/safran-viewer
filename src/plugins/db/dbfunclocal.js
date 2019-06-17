import PouchDB from 'pouchdb';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { DESIGNS, DESIGNS_MAPPER } from './couchdb/schema';

export const config$ = new BehaviorSubject({});

const DATABASE_NAME = 'safran_db';

const installDB = async db => {
  const values = await db.bulkGet({ docs: DESIGNS });
  for (let result of values.results) {
    for (let doc of result.docs) {
      if (doc.ok) {
        //db.remove(doc.ok._id, doc.ok._rev);
      }
    }
    //db.put(DESIGNS_MAPPER[result.id]);
  }
};

const localDB = () => {
  const db = new PouchDB(DATABASE_NAME, { auto_compaction: true });
  let ready = false;

  return async request => {
    if (!ready) {
      await installDB(db);
      ready = true;
    }
    return await request(db);
  };
};

const db$ = localDB();
const requests$ = new ReplaySubject(5);

const sub$ = requests$.pipe(
  concatMap(request => db$(request))
);

