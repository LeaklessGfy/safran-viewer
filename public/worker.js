self.importScripts('linenavigator.min.js');

const FIRST_VALUE_SAMPLE = 2;

const parse = (line, min) => {
  const arr = line.split(';');
  if (arr.length < min) {
    return false;
  }
  return arr;
};

const collectWithOffset = (arr, offset, converter) => {
  const collected = [];
  for (let i = offset; i < arr.length; i++) {
    if (!arr[i]) continue;
    collected.push(converter(arr[i]));
  }
  return collected;
};

const collectFromLine = (line, offset, converter) => {
  const arr = parse(line, offset + 1);
  if (!arr) {
    return false;
  }
  return collectWithOffset(arr, offset, converter);
};

const readMetadata = navigator => {
  return new Promise((resolve, reject) => {
    navigator.readLines(0, 2, function(err, index, lines, isEof, progress) {
      if (err || isEof || lines.length < 2) {
        return reject(new Error('Malformed file (metadata) : ' + err));
      }
      const arr1 = parse(lines[0], 2, reject);
      const arr2 = parse(lines[1], 2, reject);
      if (!arr1 || !arr2) {
        return reject(new Error('Malformed line (metadata) : ' + lines));
      }
      const metadata = {
        startTime: arr1[1],
        endTime: arr2[1]
      };
      resolve(metadata);
      postMessage({ type: 'progress', value: progress });
    });
  });
};

const readMeasures = navigator => {
  return new Promise((resolve, reject) => {
    navigator.readLines(2, 1, function(err, index, lines, isEof, progress) {
      if (err || isEof || lines.length < 1) {
        return reject(new Error('Malformed file (measures) : ' + err));
      }
      const measures = collectFromLine(lines[0], FIRST_VALUE_SAMPLE, name => ({ name }));
      if (!measures) {
        return reject(new Error('Malformed line (measures) : ' + lines));
      }
      resolve(measures);
      postMessage({ type: 'progress', value: progress });
    });
  });
};

const readTypeAndUnit = (navigator, measures) => {
  return new Promise((resolve, reject) => {
    navigator.readLines(3, 3, function(err, index, lines, isEof, progress) {
      if (err || isEof || lines.length < 3) {
        return reject(new Error('Malformed file (type and unit)'));
      }
      const type = collectFromLine(lines[1], FIRST_VALUE_SAMPLE, v => v);
      const unit = collectFromLine(lines[2], FIRST_VALUE_SAMPLE, v => v);
      if (!type || !unit) {
        return reject(new Error('Malformed line (type and unit) : ' + lines));
      }
      for (let i = 0; i < type.length; i++) {
        const measure = measures[i];
        measure.type = type[i];
        measure.unit = unit[i];
      }
      resolve(measures);
      postMessage({ type: 'progress', value: progress });
    });
  });
};

const readSamples = (navigator, measures) => {
  const samples = [];

  return new Promise((resolve, reject) => {
    navigator.readSomeLines(6, function callback(err, index, lines, isEof, progress) {
      if (err) {
        return reject(new Error('Malformed file (samples) ' + err));
      }
      if (isEof) {
        postMessage({ type: 'progress', value: progress });
        return resolve(samples);
      }
      for (let line of lines) {
        const sample = parse(line, FIRST_VALUE_SAMPLE);
        if (!sample) {
          return reject(new Error('Malformed line (sample) : ' + index + ', ' + line));
        }
        for (let i = FIRST_VALUE_SAMPLE; i < measures.length; i++) {
          if (sample[i] && sample[i] !== 'nan') {
            if (!measures[i - FIRST_VALUE_SAMPLE].samples) {
              measures[i - FIRST_VALUE_SAMPLE].samples = [];
            } 
            samples.push({
              value: sample[i],
              time: sample[1],
            });
            measures[i - FIRST_VALUE_SAMPLE].samples.push({
              value: sample[i],
              time: sample[1]
            });
          }
        }
      }
      navigator.readSomeLines(index + 1, callback);
      postMessage({ type: 'progress', value: progress });
    });
  });
};

addEventListener("message", async function(event) {
  const navigator = new LineNavigator(event.data, {
    chunkSize: 1024 * 20,
    throwOnLongLines: true
  });

  const metadata = await readMetadata(navigator);
  const measures = await readMeasures(navigator);
  const measuresTypeAndUnit = await readTypeAndUnit(navigator, measures);
  const samples = await readSamples(navigator, measuresTypeAndUnit);

  postMessage({ value: JSON.stringify(measuresTypeAndUnit) });

  //console.log(m);

  /*
  console.log("START");
  navigator.readSomeLines(0, function callback(err, index, lines, isEof, progress) {
    if (isEof) {
      console.log("END");
      return;
    }
    postMessage(progress);
    navigator.readSomeLines(index + 1, callback)
  });
  */
}, false);
