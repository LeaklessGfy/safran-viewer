import { parse, format } from 'date-fns';

export const stringToDate = str => parse(str);

export const dateToTime = date => format(date, 'HH:mm:ss:SSSS');

export const timeToDate = (time, date) => {
  const timeSplit = time.split(':');
  const hours = timeSplit.length > 0 ? timeSplit[0] : '0';
  const mins = timeSplit.length > 1 ? timeSplit[1] : '0';
  const secs = timeSplit.length > 2 ? timeSplit[2] : '0';

  const secSplit = secs.split(',');
  const millis = secSplit.length > 1 ? secSplit[1] : '0';

  const build = new Date(date);
  build.setHours(hours);
  build.setMinutes(parseInt(mins, 10));
  build.setSeconds(parseInt(secs, 10));
  build.setMilliseconds(parseInt(millis, 10));

  return build;
};
