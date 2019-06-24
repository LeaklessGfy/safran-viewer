import { DateTime } from 'luxon';

const DATE = 'dd/MM/yyyy';
const TIME = 'HH:mm:ss.SSS';

export function addMilliseconds(epoch, milliseconds) {
  return parse(epoch).plus({ milliseconds }).toMillis();
}

export function epochToString(epoch) {
  return parse(epoch).toFormat(DATE + ' ' + TIME);
}

export function epochToTime(epoch) {
  return parse(epoch).toFormat(TIME);
}

export function timeToEpoch(time, epoch) {
  const date = DateTime.fromFormat(time, TIME, { zone: 'utc' });
  const base = parse(epoch);

  return date.set({
    year: base.year,
    month: base.month,
    day: base.day
  }).toMillis();
}

function parse(timestamp) {
  return DateTime.fromMillis(timestamp, { zone: 'utc' });
}
