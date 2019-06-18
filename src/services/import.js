import { Subject } from 'rxjs';

const createData = (experiment, samplesFile, alarmsFile) => {
  const formData = new FormData();
  formData.append('experiment', JSON.stringify(experiment));
  formData.append('samples', samplesFile);
  formData.append('alarms', alarmsFile);
  formData.append('output', 'influx');
  return formData;
};

const createSource = (channel, subject) => {
  const source = new EventSource('http://localhost:8888/events?channel=' + channel);
  source.onmessage = event => {
    const message = JSON.parse(event.data);
    subject.next(message);
    if (message.status === 'success') {
      source.close();
      return subject.complete();
    } else if (message.status === 'failure') {
      source.close();
      return subject.error(message);
    }
  };
};

const postData = (subject, body) => {
  fetch('http://localhost:8888/upload', { method: 'POST', body })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  })
  .then(report => {
    if (report.status === 'failure') {
      subject.error(report);
      throw new Error(Object.values(report.errors).join(','));
    }
    createSource(report.chanel, subject);
  })
  .catch(err => {
    subject.error(err);
  });
};

export default (experiment, samplesFile, alarmsFile) => {
  const subject = new Subject();
  const formData = createData(experiment, samplesFile, alarmsFile);
  postData(subject, formData);
  return subject;
};
