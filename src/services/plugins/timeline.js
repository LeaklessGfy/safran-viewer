import { differenceInMilliseconds } from 'date-fns';
import { epochToTime } from '../date';

export default (samples, date) => {
  const timeline = [];
  for (const s of samples) {
    const measure = s.measure;
    const data = findNearest(s.samples, date);
    timeline.push({
      measure: measure.name,
      type: measure.type,
      unit: measure.unit,
      time: epochToTime(date),
      value: data ? data : '-'
    });
  }
  return timeline;
};

const findASC = (samples, date) => {
  let bestDiff = Infinity;
  let bestSample = null;
  for (const sample of samples) {
    const diff = Math.abs(sample.time - date);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestSample = sample;
    } else if (diff > bestDiff) {
      break;
    }
  }
  return bestSample;
};

const findDESC = (samples, date) => {
  let bestDiff = Infinity;
  let bestSample = null;
  for (let i = samples.length - 1; i > -1; i--) {
    const sample = samples[i];
    const diff = Math.abs(sample.time - date);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestSample = sample;
    } else if (diff > bestDiff) {
      break;
    }
  }
  return bestSample;
};

const findNearest = (samples, date) => {
  if (samples.length < 1) {
    return null;
  }

  let bestSample = null;
  const firstSample = samples[0];
  const lastSample = samples[samples.length - 1];

  if (Math.abs(firstSample.time - date) < Math.abs(lastSample.time - date)) {
    bestSample = findASC(samples, date);
  } else {
    bestSample = findDESC(samples, date);
  }

  if (!bestSample) {
    return null;
  }

  const diffSeconds = differenceInMilliseconds(bestSample.time, date);
  if ((bestSample === firstSample && diffSeconds > 10) || (bestSample === lastSample && diffSeconds < 10)) {
    return null;
  }
  if (Math.abs(diffSeconds) > 500) {
    return null;
  }
  return bestSample.value;
};
