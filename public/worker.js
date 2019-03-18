self.importScripts('linenavigator.min.js');
self.importScripts('experiment.reader.js');
self.importScripts('alarms.reader.js');

const handleExperiment = async navigator => {
  const value = await readExperiment(navigator);
  postMessage({ type: 'experiment', value: JSON.stringify(value.measures) });
};

const handleAlarms = async navigator => {
  const value = await readAlarms(navigator);
  postMessage({ type: 'alarms', value: JSON.stringify(value) });
};

addEventListener("message", async function(event) {
  const navigator = new LineNavigator(event.data.file, {
    chunkSize: 1024 * 20,
    throwOnLongLines: true
  });
  switch(event.data.type) {
    case 'experiment':
      return handleExperiment(navigator).catch(e => setTimeout(() => { throw new Error(e); }));
    case 'alarms':
      return handleAlarms(navigator).catch(e => setTimeout(() => { throw new Error(e); }));
  }
}, false);
