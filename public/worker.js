self.importScripts('linenavigator.min.js');
self.importScripts('experiment-parser.js');

addEventListener("message", async function(event) {
  const experimentId = event.data.experimentId;
  const experimentReader = new LineNavigator(event.data.experimentFile, {
    chunkSize: Number.MAX_SAFE_INTEGER,
    throwOnLongLines: true
  });
  const alarmsReader = event.data.alarmsFile ? new LineNavigator(event.data.alarmsFile, {
    throwOnLongLines: true
  }) : null;

  const parser = new ExperimentParser(experimentId, experimentReader, alarmsReader, {
    onProgress: progress => postMessage({ type: 'progress', value: progress })
  });
  const metadata = await parser.parse();

  postMessage(metadata)
}, false);
