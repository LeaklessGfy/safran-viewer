import { parse, format, getTime, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

export const dateToString = date => format(date, 'DD/MM/YYYY HH:mm:ss:SSS');

export const dateToTimestamp = date => getTime(date);

export const stringToDate = str => parse(str);

export const dateToTime = date => format(date, 'HH:mm:ss:SSS');

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

  const timeSplit = time.split(':');
  let hours = date.getHours(),
    mins = date.getMinutes(),
    secs = date.getSeconds(),
    millis = date.getMilliseconds();

  if (timeSplit.length > 3) {
    hours = timeSplit[0];
    mins = timeSplit[1];
    secs = timeSplit[2];
    millis = timeSplit[3];
  } else {
    throw new Error('Error while parsing');
  }

  let build = new Date(date);
  build = setHours(build, parseInt(hours, 10));
  build = setMinutes(build, parseInt(mins, 10));
  build = setSeconds(build, parseInt(secs, 10));
  build = setMilliseconds(build, parseInt(millis, 10)); // TODO: Find a fix for 4 digit millis

  return build;
};
