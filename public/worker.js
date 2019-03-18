self.importScripts('linenavigator.min.js');
self.importScripts('experiment-parser.js');

addEventListener("message", async function(event) {
  const experimentReader = new LineNavigator(event.data.experiment, {
    chunkSize: Number.MAX_SAFE_INTEGER,
    throwOnLongLines: true
  });
  const alarmsReader = event.data.alarms ? new LineNavigator(event.data.alarms, {
    throwOnLongLines: true
  }) : null;

  const parser = new ExperimentParser(0, experimentReader, alarmsReader, {
    onProgress: progress => postMessage({ type: 'progress', value: progress })
  });
  const metadata = await parser.parse();

  postMessage(metadata)
}, false);
