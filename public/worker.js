self.importScripts('navigator.js');
self.importScripts('stream-experiment-parser.js');

function checkMultipleErrors(dbInfo) {
  console.log(dbInfo);
}

addEventListener("message", async function(event) {
  const { db, experiment, experimentFile, alarmsFile } = event.data.db;
  
  const experimentReader = new LineNavigator(experimentFile, {
    chunkSize: 1024 * 100,
    throwOnLongLines: true
  });
  const alarmsReader = alarmsFile ? new LineNavigator(alarmsFile, {
    throwOnLongLines: true
  }) : null;

  let formerProgress = 0;
  const parser = new ExperimentParser(experimentReader, alarmsReader, {
    onProgress: progress => {
      if (formerProgress !== progress) {
        postMessage({ type: 'progress', value: progress });
        formerProgress = progress;
      }
    }
  });

  const metadata = await parser.parseMetadata();
  experiment.updateMetadata(metadata);
  const dbExperiment = await db.insertDoc(experiment);
  if (!dbExperiment.ok) {
    // error
  }
  const experimentId = dbExperiment.id;

  const measures = await parser.parseMeasures(experimentId);
  const dbMeasures = await db.insertMultipleDocs(measures);
  checkMultipleErrors(dbMeasures);
  const measuresId = [];

  let isEof = false;
  let index = 6;
  while (isEof) {
    const samplesSub = await parser.parseSamples(measuresId, 500, index);
    if (samplesSub.isEof) {
      isEof = true;
    }
    index = samplesSub.nextIndex;
    const dbSamples = await db.insertMultipleDocs(samplesSub.samples);
    checkMultipleErrors(dbSamples);
  }

  const alarms = await parser.parseAlarms(experimentId);
  const dbAlarms = await db.insertMultipleDocs(alarms);
  checkMultipleErrors(dbAlarms);

  postMessage();
}, false);
