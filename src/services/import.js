import { Subject } from 'rxjs';
import * as Comlink from 'comlinkjs';

const SAMPLE_STACK_INSERT = 500;

export default class ImportService {
  _db;
  _experiment;
  _worker;
  _subject;
  _idHolder;

  _parser;

  constructor(db, experiment) {
    this._db = db;
    this._experiment = experiment;
    this._worker = new Worker('stream-experiment-parser.js');
    this._subject = new Subject();
    this._idHolder = {
      experiment: null,
      measures: []
    };
  }

  async init(experimentFile, alarmsFile) {
    this._parser = await new Comlink.proxy(this._worker)(
      experimentFile,
      alarmsFile
    );
    return this._subject;
  }

  async import() {
    await this.importExperiment();
    await this.importMeasures();
    this.importSamples();
    this.importAlarms();
  }

  async importExperiment() {
    const metadata = await this._parser.parseMetadata();
    this._experiment.updateMetadata(metadata);

    const dbExperiment = await this._db.insertDoc(this._experiment);
    if (!dbExperiment.ok) {
      return this._subject.error(dbExperiment);
    }
    this._idHolder.experiment = dbExperiment.id;
  }

  async importMeasures() {
    const measures = await this._parser.parseMeasures(this._experiment.id);
    const dbMeasures = await this._db.insertMultipleDocs(measures);
    const errors = dbMeasures.filter(info => !info.ok);
    if (errors.length > 0) {
      return this._subject.error(errors);
    }
    this._idHolder.measures = dbMeasures.map(info => info.id);
  }

  async importSamples() {
    let isEof = false;
    let index = 6;
    while (isEof) {
      const samplesSub = await this._parser.parseSamples(this._idHolder.measures, SAMPLE_STACK_INSERT, index);
      if (samplesSub.isEof) {
        isEof = true;
      }
      index = samplesSub.nextIndex;

      this._db.insertMultipleDocs(samplesSub.samples)
      .then(dbSamples => {
        const errors = dbSamples.filter(info => !info.ok);
        if (errors.length > 0) {
          this._subject.error(errors);
          isEof = true;
        }
      });
    }
  }

  async importAlarms() {
    const alarms = await this._parser.parseAlarms(this._idHolder.experiment);
    const dbAlarms = await this._db.insertMultipleDocs(alarms);
    const errors = dbAlarms.filter(info => !info.ok);
    if (errors.length > 0) {
      return this._subject.error(errors);
    }
  }
}
