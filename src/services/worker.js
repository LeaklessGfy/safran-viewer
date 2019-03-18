import { Observable } from 'rxjs';
import { downloadFile } from './file';

export const callWorker = (experiment, alarms) => {
  return new Observable(subscriber => {
    const worker = new Worker('worker.js');

    worker.addEventListener('message', event => {
      if (event.data.type === 'progress') {
        return subscriber.next(event.data.value);
      }
      downloadFile('dump.json', JSON.stringify(event.data), 'json');
      worker.terminate();
      subscriber.complete();
    }, false);

    worker.addEventListener('error', err => {
      return subscriber.error(err);
    }, false);

    worker.postMessage({ experiment, alarms });
  });
}
