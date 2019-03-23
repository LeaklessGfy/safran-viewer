import { Observable } from 'rxjs';

export const callWorker = (db, experiment, experimentFile, alarmsFile, onComplete) => {
  return new Observable(subscriber => {
    const worker = new Worker('worker.js');

    worker.addEventListener('message', event => {
      if (event.data.type === 'progress') {
        return subscriber.next(event.data.value);
      }
      worker.terminate();
      onComplete(event.data);
      subscriber.complete();
    }, false);

    worker.addEventListener('error', err => {
      return subscriber.error(err);
    }, false);

    worker.postMessage({ db, experiment, experimentFile, alarmsFile });
  });
}
