import { Observable } from 'rxjs';

const saveFile = (filename, data, type) => {
  const file = new Blob([data], { type });
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);  
  }, 0); 
};

export const readExperiment = file => {
  return new Observable(subscriber => {
    const worker = new Worker('worker.js');
    worker.addEventListener('message', event => {
      if (event.data.type === 'progress') {
        subscriber.next(event.data.value);
      } else {
        saveFile('experiment.json', event.data.value, 'json');
        worker.terminate();
        subscriber.complete();
      }
    }, false);
    worker.addEventListener('error', err => {
      subscriber.error(err);
    }, false);
    worker.postMessage({ type: 'experiment', file });
  });
};

export const readAlarms = file => {
  return new Observable(subscriber => {
    const worker = new Worker('worker.js');
    worker.addEventListener('message', event => {
      if (event.data.type === 'progress') {
        subscriber.next(event.data.value);
      } else {
        saveFile('alarms.json', event.data.value, 'json');
        worker.terminate();
        subscriber.complete();
      }
    }, false);
    worker.addEventListener('error', err => {
      subscriber.error(err);
    }, false);
    worker.postMessage({ type: 'alarms', file });
  });
};
