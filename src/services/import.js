import { Subject } from 'rxjs';
import * as Comlink from 'comlinkjs';

const SAMPLE_STACK_INSERT = 500;

export default class ImportService {
  _db;
  _worker;

  _experiment;
  _subject;
  _parser;
  _idHolder;

  constructor(db) {
    this._db = db;
    this._worker = new Worker('stream-experiment-parser.js');
  }

  async init(experiment, experimentFile, alarmsFile) {
    const ExperimentParser = Comlink.proxy(this._worker);
    this._experiment = experiment;
    this._subject = new Subject();
    this._parser = await new ExperimentParser(
      experimentFile,
      alarmsFile,
      Comlink.proxyValue({
        onProgress: progress => this._subject.next(progress)
      })
    );
    this._idHolder = {
      experiment: null,
      measures: []
    };
    return this._subject;
  }

  async import() {
    await this.importExperiment();
    await this.importMeasures();
    Promise.all([this.importSamples(), this.importAlarms()])
    .then(() => {
      this._subject.complete();
    });
  }

  async importExperiment() {
    const metadata = await this._parser.parseMetadata();
    Object.assign(this._experiment, metadata);
    const experimentId = await this._db.insertExperiment(this._experiment);
    if (!experimentId) {
      return this._subject.error(new Error('Error in insert experiment'));
    }
    this._idHolder.experiment = experimentId;
  }

  async importMeasures() {
    const measures = await this._parser.parseMeasures();
    try {
      const measuresId = await this._db.insertMeasures(this._idHolder.experiment, measures);
      if (!measuresId) {
        this._db.removeExperiment(this._idHolder.experiment);
        return this._subject.error(new Error('Error in insert measures'));
      }
      this._idHolder.measures = measuresId;
    } catch (err) {
      this._db.removeExperiment(this._idHolder.experiment);
      throw err;
    }
  }

  async importSamples() {
    let isEof = false;
    let index = 6;
    while (!isEof) {
      const samplesSub = await this._parser.parseSamples(this._idHolder.measures, SAMPLE_STACK_INSERT, index);
      if (samplesSub.isEof) {
        isEof = true;
      }
      index = samplesSub.nextIndex;
      this._db.insertSamples(this._idHolder.experiment, samplesSub.samples, this._experiment.beginTime);
    }
  }

  async importAlarms() {
    const alarms = await this._parser.parseAlarms();
    if (alarms.length > 0) {
      await this._db.insertAlarms(this._idHolder.experiment, alarms, this._experiment.beginTime);      
    }
  }
}
