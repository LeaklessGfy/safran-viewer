import { Subject } from 'rxjs';

export default class ImportService {
  _subject;
  _formData;
  _source;

  async init(experiment, samplesFile, alarmsFile) {
    this._subject = new Subject();

    this._formData = new FormData();
    this._formData.append('experiment', JSON.stringify(experiment));
    this._formData.append('samples', samplesFile);
    this._formData.append('alarms', alarmsFile);

    return this._subject;
  }

  async import() {
    fetch('http://localhost:8888/upload', {
      method: 'POST',
      body: this._formData
    })
    .then(response => {
      return response.json();
    })
    .then(report => {
      if (report.status === 'failure') {
        this._subject.error(report);
        throw new Error(Object.values(report.errors).join(','));
      }

      this._source = new EventSource('http://localhost:8888/events?channel=' + report.channel);
      this._source.onmessage = this.onMessage.bind(this);
    });
  }

  onMessage(event) {
    const data = JSON.parse(event.data);
    this._subject.next(data);

    if (data.status === 'success') {
      this._source.close();
      return this._subject.complete();
    } else if (data.status === 'failure') {
      this._source.close();
      return this._subject.error(data);
    }
  }
}
