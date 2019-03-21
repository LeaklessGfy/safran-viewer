const FIRST_COLUMN_SAMPLE = 2;

class ExperimentParser {
  _experimentId;
  _experimentReader;
  _alarmsReader;
  _metadata;
  _observer;

  constructor(experimentId, experimentReader, alarmsReader, observer) {
    this._experimentId = experimentId;
    this._experimentReader = experimentReader;
    this._alarmsReader = alarmsReader;
    this._observer = observer;
    this._metadata = {
      beginTime: null,
      endTime: null,
      measures: [],
      alarms: [],
      samples: []
    }
  }

  async parse() {
    await this._parseHeader();
    await this._parseMeasures()
    await this._parseSamples(6);
    if (this._alarmsReader) {
      await this._parseAlarms(0);
    }

    return this._metadata;
  }

  async _parseHeader() {
    const info = await this._readLine(this._experimentReader, 0, 2);
    this._checkLine(info, 2);
    const arr1 = this._parse(info.lines[0], 2);
    const arr2 = this._parse(info.lines[1], 2);
    this._metadata.beginTime = arr1[1];
    this._metadata.endTime = arr2[1];
    this._observer.onProgress(info.progress);
  }

  async _parseMeasures() {
    const info = await this._readLine(this._experimentReader, 2, 1);
    this._checkLine(info, 1);
    this._metadata.measures = this._collector(
      this._parse(info.lines[0], FIRST_COLUMN_SAMPLE),
      FIRST_COLUMN_SAMPLE,
      v => v,
      v => this._parseMeasure(v)
    );
    await this._parseTypesUnits();
    this._observer.onProgress(info.progress);
  }

  async _parseTypesUnits() {
    const info = await this._readLine(this._experimentReader, 3, 3);
    this._checkLine(info, 3);
    const type = this._collector(
      this._parse(info.lines[1], FIRST_COLUMN_SAMPLE),
      FIRST_COLUMN_SAMPLE,
      () => true,
      v => v
    );
    const unit = this._collector(
      this._parse(info.lines[2], FIRST_COLUMN_SAMPLE),
      FIRST_COLUMN_SAMPLE,
      () => true,
      v => v
    );
    for (let i in type) {
      this._parseTypeUnit(i, type, unit);
    }
    this._observer.onProgress(info.progress);
  }

  async _parseSamples(index) {
    const info = await this._readLines(this._experimentReader, index);
    if (info.err) {
      throw new Error(info.err);
    }
    for (let line of info.lines) {
      this._parseSample(line);
    }
    this._observer.onProgress(info.progress);
    if (!info.isEof) {
      await this._parseSamples(info.index + 1);
    }
  }

  _parseSample(line) {
    const samples = this._parse(line, FIRST_COLUMN_SAMPLE);
    for (let i = FIRST_COLUMN_SAMPLE; i < this._metadata.measures.length; i++) {
      if (samples[i] && samples[i].toLowerCase() !== 'nan') {
        const sample = {
          typeX: 'sample',
          value: samples[i],
          time: samples[1],
        };
        this._metadata.samples.push(sample);
        this._metadata.measures[i - FIRST_COLUMN_SAMPLE].samples.push(sample);
      }
    }
  }

  async _parseAlarms(index) {
    const info = await this._readLines(this._alarmsReader, index);
    if (info.err) {
      throw new Error(info.err);
    }
    for (let line of info.lines) {
      if (!line) continue;
      this._parseAlarm(line);
    }
    this._observer.onProgress(info.progress);
    if (!info.isEof) {
      await this._parseAlarms(info.index + 1);
    }
  }

  _parseMeasure(value) {
    return {
      typeX: 'measure',
      name: value,
      experiment: this._experimentId
    };
  }

  _parseTypeUnit(i, type, unit) {
    const measure = this._metadata.measures[i];
    measure.type = type[i];
    measure.unit = unit[i];
    measure.samples = [];
  }

  _parseAlarm(line) {
    const arr = this._parse(line, 3);
    this._metadata.alarms.push({
      typeX: 'alarm',
      reference: null,
      name: null,
      state: null,
      order: null,
      time: arr[0], // LOCAL DATE TIME
      level: parseInt(arr[1], 10),
      message: arr[2],
      experiment: this._experimentId
    });
  }

  _readLine(reader, index, number) {
    return new Promise(resolve => {
      reader.readLines(index, number, function(err, index, lines, isEof, progress) {
        resolve({
          err,
          index,
          lines,
          isEof,
          progress
        });
      });
    });
  }

  _readLines(reader, index) {
    return new Promise(resolve => {
      reader.readSomeLines(index, function (err, index, lines, isEof, progress) {
        resolve({
          err,
          index,
          lines,
          isEof,
          progress
        })
      });
    });
  }

  _checkLine(info, min) {
    if (info.err || info.isEof || info.lines.length < min) {
      throw new Error('Malformed file (metadata) : ' + info.err);
    }
  }

  _parse(line, min) {
    const arr = line.split(';');
    if (arr.length < min) {
      throw new Error('Malformed line ' + line);
    }
    return arr;
  }

  _collector(arr, skip, filter, map) {
    const collected = [];
    for (let i = skip; i < arr.length; i++) {
      if (!filter(arr[i])) continue;
      collected.push(map(arr[i]));
    }
    return collected;
  }
}
