const FIRST_COLUMN_SAMPLE = 2;

class ExperimentParser {
  _experimentReader;
  _alarmsReader;
  _observer;

  constructor(experimentReader, alarmsReader, observer) {
    this._experimentReader = experimentReader;
    this._alarmsReader = alarmsReader;
    this._observer = observer;
  }

  async parseMetadata() {
    const info = await this._readLine(this._experimentReader, 0, 2);
    this._checkLine(info, 2);
    this._observer.onProgress(info.progress);

    const arr1 = this._parse(info.lines[0], 2);
    const arr2 = this._parse(info.lines[1], 2);
    const beginTime = arr1[1];
    const endTime = arr2[1];

    return { beginTime, endTime };
  }

  async parseMeasures(experimentId) {
    const info = await this._readLine(this._experimentReader, 2, 1);
    this._checkLine(info, 1);
    this._observer.onProgress(info.progress);

    const measures = this._collector(
      this._parse(info.lines[0], FIRST_COLUMN_SAMPLE),
      FIRST_COLUMN_SAMPLE,
      v => v,
      v => this._parseMeasure(v, experimentId)
    );

    const { types, units } = await this._parseTypesUnits();
    for (let i in types) {
      measures[i].type = types[i];
      measures[i].unit = units[i];
      //measures[i].samples = [];
    }

    return measures;
  }

  async _parseTypesUnits() {
    const info = await this._readLine(this._experimentReader, 3, 3);
    this._checkLine(info, 3);
    this._observer.onProgress(info.progress);

    const types = this._collector(
      this._parse(info.lines[1], FIRST_COLUMN_SAMPLE),
      FIRST_COLUMN_SAMPLE,
      () => true,
      v => v
    );
    const units = this._collector(
      this._parse(info.lines[2], FIRST_COLUMN_SAMPLE),
      FIRST_COLUMN_SAMPLE,
      () => true,
      v => v
    );

    return { types, units };
  }

  async parseSamples(measuresId, size, index = 6) {
    let isEof = false;
    let i;
    const samples = [];

    for (i = 0; i < size; i++) {
      const info = await this._readLine(this._experimentReader, index + i, 1);
      this._checkLineEof(info, 1);
      this._observer.onProgress(info.progress);

      const arr = this._parse(info.lines[0], FIRST_COLUMN_SAMPLE);
      for (let i = FIRST_COLUMN_SAMPLE; i < measuresId.length; i++) {
        if (arr[i] && arr[i].toLowerCase() !== 'nan') {
          const sample = this._parseSample(arr[i], arr[1], measuresId[i - FIRST_COLUMN_SAMPLE]);
          samples.push(sample);
        }
      }

      if (info.isEof) {
        isEof = true;
        break;
      }
    }

    return { samples, isEof, nextIndex: i + index };
  }

  async parseAlarms(experimentId) {
    let isEof = false;
    const alarms = [];

    for (let i = 0; !isEof; i++) {
      const info = await this._readLine(this._alarmsReader, i, 1);
      this._checkLineEof(info, 1);
      this._observer.onProgress(info.progress);

      const line = info.lines[0];
      if (!line) continue;

      const arr = this._parse(line, 3);
      const alarm = this._parseAlarm(arr[0], arr[1], arr[2], experimentId);
      alarms.push(alarm);

      if (info.isEof) {
        isEof = true;
        break;
      }
    }

    return alarms;
  }

  _parseMeasure(name, experiment) {
    return {
      typeX: 'measure',
      name,
      experiment
    };
  }

  _parseSample(value, time, measure) {
    return {
      typeX: 'sample',
      value,
      time,
      measure
    };
  }

  _parseAlarm(time, level, message, experiment) {
    return {
      typeX: 'alarm',
      //reference: null,
      //name: null,
      //state: null,
      //order: null,
      time, // LOCAL DATE TIME
      level: parseInt(level, 10),
      message,
      experiment
    };
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

  _checkLine(info, min) {
    if (info.err || info.isEof || info.lines.length < min) {
      throw new Error('Malformed file : ' + info.err);
    }
  }

  _checkLineEof(info, min) {
    if (info.err || info.lines.length < min) {
      throw new Error('Malformed file : ' + info.err);
    }
  }

  _parse(line, min) {
    const arr = line.split(';');
    if (arr.length < min) {
      throw new Error('Malformed line ' + line + ', expected ' + min + ' length and got : ' + arr.length);
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
