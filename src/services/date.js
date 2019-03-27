import { parse, format, getTime } from 'date-fns';

export const dateToTimestamp = date => getTime(date);

export const stringToDate = str => parse(str);

export const dateToTime = date => format(date, 'HH:mm:ss:SSSS');

export const timeToTimestamp = (time, date) => {
  const build = timeToDate(time, date);
  return dateToTimestamp(build);
};

export const timeToDate = (time, date) => {
  if (!(date instanceof Date)) {
    date = stringToDate(date);
  }

  const timeSplit = time.split(':');
  let hours = date.getHours(),
    mins = date.getMinutes(),
    secs = date.getSeconds(),
    millis = date.getMilliseconds();

  if (timeSplit.length > 2) {
    hours = timeSplit.length > 0 ? timeSplit[0] : hours;
    mins = timeSplit.length > 1 ? timeSplit[1] : mins;
    secs = timeSplit.length > 2 ? timeSplit[2] : secs;
    const secSplit = secs.split(',');
    millis = secSplit.length > 1 ? secSplit[1] : millis;
  } else {
    mins = timeSplit.length > 0 ? timeSplit[0] : mins;
    secs = timeSplit.length > 1 ? timeSplit[1] : secs;
    const secSplit = secs.split(',');
    millis = secSplit.length > 1 ? secSplit[1] : millis;
  }

  const build = new Date(date);
  build.setHours(parseInt(hours, 10));
  build.setMinutes(parseInt(mins, 10));
  build.setSeconds(parseInt(secs, 10));
  build.setMilliseconds(parseInt(millis, 10));

  return build;
};
