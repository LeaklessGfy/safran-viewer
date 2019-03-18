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

export const importFile = file => {
  return new Observable(subscribe => {
    var worker= new Worker('worker.js');
    worker.postMessage(file); 
    worker.addEventListener('message', event => {
      if (event.data.type === 'progress') {
        subscribe.next(event.data.value);
      } else {
        saveFile('dump.json', event.data.value, 'json');
      }
    });
  });
};
