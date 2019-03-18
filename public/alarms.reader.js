const read = navigator => {
  return new Promise((resolve, reject) => {
    const alarms = [];
    navigator.readSomeLines(0, function callback(err, index, lines, isEof, progress) {
      if (err) {
        return reject(new Error('Malformed file (alarms) ' + err));
      }
      for (let line of lines) {
        const arr = line.split(';');
        if (arr.length < 3) continue;
        alarms.push({
          reference: null,
          name: null,
          state: null,
          order: null,
          time: arr[0],
          level: arr[1],
          message: arr[2],
          experiment: 0
        });
      }
      postMessage({ type: 'progress', value: progress });
      if (isEof) {
        return resolve(alarms);
      }
    });
  });
};

const readAlarms = async navigator => {
  const alarms = await read(navigator);

  return alarms;
};
