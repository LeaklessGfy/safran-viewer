import { parse, format, getTime } from 'date-fns';

export const dateToString = date => format(date, 'DD/MM/YYYY HH:mm:ss.SSS');

export const dateToISO = date => format(date, 'YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

export const dateToTimestamp = date => getTime(date);

export const stringToDate = str => parse(str);

export const dateToTime = date => format(toUTC(parse(date)), 'HH:mm:ss.SSS');

export const timeToTimestamp = (time, date) => {
  const build = timeToDate(time, date);
  return dateToTimestamp(build);
};

export const timeToDate = (time, date) => {
  if (!date) {
    throw new Error('Undefined date');
  }
  if (!(date instanceof Date)) {
    date = stringToDate(date);
  }
  const utc = toUTC(date);

  const timeSplit = time.split(new RegExp('[' + [':', ',', '.'].join('|') + ']', 'g'));
  let hours = utc.getHours(),
    mins = utc.getMinutes(),
    secs = utc.getSeconds(),
    millis = utc.getMilliseconds();

  if (timeSplit.length === 3) {
    mins = timeSplit[0];
    secs = timeSplit[1];
    millis = timeSplit[2];
  } else if (timeSplit.length === 4) {
    hours = timeSplit[0];
    mins = timeSplit[1];
    secs = timeSplit[2];
    millis = timeSplit[3];
  }

  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    parseInt(hours, 10),
    parseInt(mins, 10),
    parseInt(secs, 10),
    parseInt(millis, 10)
  ));
};

export const validateDate = (date, startDate, endDate) => {
  if (date < startDate) {
    return startDate;
  } else if (date > endDate) {
    return endDate;
  }
  return date;
};

export const toUTC = date => new Date(
  date.getUTCFullYear(),
  date.getUTCMonth(),
  date.getUTCDate(),
  date.getUTCHours(),
  date.getUTCMinutes(),
  date.getUTCSeconds(),
  date.getUTCMilliseconds()
);
