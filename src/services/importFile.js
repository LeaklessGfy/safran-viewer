export const importFile = file => {
  var worker= new Worker('worker.js');
  worker.postMessage(file); 
}
