import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

const AlarmTooltip = `<center><strong>{name}</strong></center>
<hr />
<table>
<tr>
  <th align="left">Level</th>
  <td>{valueY}</td>
</tr>
<tr>
  <th align="left">State</th>
  <td>{state}</td>
</tr>
<tr>
  <th align="left">Message</th>
  <td>{message}</td>
</tr>
<tr>
  <th align="left">Order</th>
  <td>{order}</td>
</tr>
</table>
<hr />`;

const MeasureTooltip = `<center><strong>{name}</strong></br>
<b align="center">{valueY}&nbsp;{unit}</b></center>`;

const data = [{
  "date": "2012-07-27",
  "value": 13
}, {
  "date": "2012-07-28",
  "value": 11
}, {
  "date": "2012-07-29",
  "value": 15
}, {
  "date": "2012-07-30",
  "value": 16
}, {
  "date": "2012-07-31",
  "value": 18
}, {
  "date": "2012-08-01",
  "value": 13
}, {
  "date": "2012-08-02",
  "value": 22
}, {
  "date": "2012-08-03",
  "value": 23
}, {
  "date": "2012-08-04",
  "value": 20
}, {
  "date": "2012-08-05",
  "value": 17
}, {
  "date": "2012-08-06",
  "value": 16
}, {
  "date": "2012-08-07",
  "value": 18
}, {
  "date": "2012-08-08",
  "value": 21
}, {
  "date": "2012-08-09",
  "value": 26
}, {
  "date": "2012-08-10",
  "value": 24
}, {
  "date": "2012-08-11",
  "value": 29
}, {
  "date": "2012-08-12",
  "value": 32
}, {
  "date": "2012-08-13",
  "value": 18
}, {
  "date": "2012-08-14",
  "value": 24
}, {
  "date": "2012-08-15",
  "value": 22
}, {
  "date": "2012-08-16",
  "value": 18
}, {
  "date": "2012-08-17",
  "value": 19
}, {
  "date": "2012-08-18",
  "value": 14
}, {
  "date": "2012-08-19",
  "value": 15
}, {
  "date": "2012-08-20",
  "value": 12
}, {
  "date": "2012-08-21",
  "value": 8
}, {
  "date": "2012-08-22",
  "value": 9
}, {
  "date": "2012-08-23",
  "value": 8
}, {
  "date": "2012-08-24",
  "value": 7
}, {
  "date": "2012-08-25",
  "value": 5
}, {
  "date": "2012-08-26",
  "value": 11
}, {
  "date": "2012-08-27",
  "value": 13
}, {
  "date": "2012-08-28",
  "value": 18
}, {
  "date": "2012-08-29",
  "value": 20
}, {
  "date": "2012-08-30",
  "value": 29
}, {
  "date": "2012-08-31",
  "value": 33
}, {
  "date": "2012-09-01",
  "value": 42
}, {
  "date": "2012-09-02",
  "value": 35
}, {
  "date": "2012-09-03",
  "value": 31
}, {
  "date": "2012-09-04",
  "value": 47
}, {
  "date": "2012-09-05",
  "value": 52
}, {
  "date": "2012-09-06",
  "value": 46
}, {
  "date": "2012-09-07",
  "value": 41
}, {
  "date": "2012-09-08",
  "value": 43
}, {
  "date": "2012-09-09",
  "value": 40
}, {
  "date": "2012-09-10",
  "value": 39
}, {
  "date": "2012-09-11",
  "value": 34
}, {
  "date": "2012-09-12",
  "value": 29
}, {
  "date": "2012-09-13",
  "value": 34
}, {
  "date": "2012-09-14",
  "value": 37
}, {
  "date": "2012-09-15",
  "value": 42
}, {
  "date": "2012-09-16",
  "value": 49
}, {
  "date": "2012-09-17",
  "value": 46
}, {
  "date": "2012-09-18",
  "value": 47
}, {
  "date": "2012-09-19",
  "value": 55
}, {
  "date": "2012-09-20",
  "value": 59
}, {
  "date": "2012-09-21",
  "value": 58
}, {
  "date": "2012-09-22",
  "value": 57
}, {
  "date": "2012-09-23",
  "value": 61
}, {
  "date": "2012-09-24",
  "value": 59
}, {
  "date": "2012-09-25",
  "value": 67
}, {
  "date": "2012-09-26",
  "value": 65
}, {
  "date": "2012-09-27",
  "value": 61
}, {
  "date": "2012-09-28",
  "value": 66
}, {
  "date": "2012-09-29",
  "value": 69
}, {
  "date": "2012-09-30",
  "value": 71
}, {
  "date": "2012-10-01",
  "value": 67
}, {
  "date": "2012-10-02",
  "value": 63
}, {
  "date": "2012-10-03",
  "value": 46
}, {
  "date": "2012-10-04",
  "value": 32
}, {
  "date": "2012-10-05",
  "value": 21
}, {
  "date": "2012-10-06",
  "value": 18
}, {
  "date": "2012-10-07",
  "value": 21
}, {
  "date": "2012-10-08",
  "value": 28
}, {
  "date": "2012-10-09",
  "value": 27
}, {
  "date": "2012-10-10",
  "value": 36
}, {
  "date": "2012-10-11",
  "value": 33
}, {
  "date": "2012-10-12",
  "value": 31
}, {
  "date": "2012-10-13",
  "value": 30
}, {
  "date": "2012-10-14",
  "value": 34
}, {
  "date": "2012-10-15",
  "value": 38
}, {
  "date": "2012-10-16",
  "value": 37
}, {
  "date": "2012-10-17",
  "value": 44
}, {
  "date": "2012-10-18",
  "value": 49
}, {
  "date": "2012-10-19",
  "value": 53
}, {
  "date": "2012-10-20",
  "value": 57
}, {
  "date": "2012-10-21",
  "value": 60
}, {
  "date": "2012-10-22",
  "value": 61
}, {
  "date": "2012-10-23",
  "value": 69
}, {
  "date": "2012-10-24",
  "value": 67
}, {
  "date": "2012-10-25",
  "value": 72
}, {
  "date": "2012-10-26",
  "value": 77
}, {
  "date": "2012-10-27",
  "value": 75
}, {
  "date": "2012-10-28",
  "value": 70
}, {
  "date": "2012-10-29",
  "value": 72
}, {
  "date": "2012-10-30",
  "value": 70
}, {
  "date": "2012-10-31",
  "value": 72
}, {
  "date": "2012-11-01",
  "value": 73
}, {
  "date": "2012-11-02",
  "value": 67
}, {
  "date": "2012-11-03",
  "value": 68
}, {
  "date": "2012-11-04",
  "value": 65
}, {
  "date": "2012-11-05",
  "value": 71
}, {
  "date": "2012-11-06",
  "value": 75
}, {
  "date": "2012-11-07",
  "value": 74
}, {
  "date": "2012-11-08",
  "value": 71
}, {
  "date": "2012-11-09",
  "value": 76
}, {
  "date": "2012-11-10",
  "value": 77
}, {
  "date": "2012-11-11",
  "value": 81
}, {
  "date": "2012-11-12",
  "value": 83
}, {
  "date": "2012-11-13",
  "value": 80
}, {
  "date": "2012-11-14",
  "value": 81
}, {
  "date": "2012-11-15",
  "value": 87
}, {
  "date": "2012-11-16",
  "value": 82
}, {
  "date": "2012-11-17",
  "value": 86
}, {
  "date": "2012-11-18",
  "value": 80
}, {
  "date": "2012-11-19",
  "value": 87
}, {
  "date": "2012-11-20",
  "value": 83
}, {
  "date": "2012-11-21",
  "value": 85
}, {
  "date": "2012-11-22",
  "value": 84
}, {
  "date": "2012-11-23",
  "value": 82
}, {
  "date": "2012-11-24",
  "value": 73
}, {
  "date": "2012-11-25",
  "value": 71
}, {
  "date": "2012-11-26",
  "value": 75
}, {
  "date": "2012-11-27",
  "value": 79
}, {
  "date": "2012-11-28",
  "value": 70
}, {
  "date": "2012-11-29",
  "value": 73
}, {
  "date": "2012-11-30",
  "value": 61
}, {
  "date": "2012-12-01",
  "value": 62
}, {
  "date": "2012-12-02",
  "value": 66
}, {
  "date": "2012-12-03",
  "value": 65
}, {
  "date": "2012-12-04",
  "value": 73
}, {
  "date": "2012-12-05",
  "value": 79
}, {
  "date": "2012-12-06",
  "value": 78
}, {
  "date": "2012-12-07",
  "value": 78
}, {
  "date": "2012-12-08",
  "value": 78
}, {
  "date": "2012-12-09",
  "value": 74
}, {
  "date": "2012-12-10",
  "value": 73
}, {
  "date": "2012-12-11",
  "value": 75
}, {
  "date": "2012-12-12",
  "value": 70
}, {
  "date": "2012-12-13",
  "value": 77
}, {
  "date": "2012-12-14",
  "value": 67
}, {
  "date": "2012-12-15",
  "value": 62
}, {
  "date": "2012-12-16",
  "value": 64
}, {
  "date": "2012-12-17",
  "value": 61
}, {
  "date": "2012-12-18",
  "value": 59
}, {
  "date": "2012-12-19",
  "value": 53
}, {
  "date": "2012-12-20",
  "value": 54
}, {
  "date": "2012-12-21",
  "value": 56
}, {
  "date": "2012-12-22",
  "value": 59
}, {
  "date": "2012-12-23",
  "value": 58
}, {
  "date": "2012-12-24",
  "value": 55
}, {
  "date": "2012-12-25",
  "value": 52
}, {
  "date": "2012-12-26",
  "value": 54
}, {
  "date": "2012-12-27",
  "value": 50
}, {
  "date": "2012-12-28",
  "value": 50
}, {
  "date": "2012-12-29",
  "value": 51
}, {
  "date": "2012-12-30",
  "value": 52
}, {
  "date": "2012-12-31",
  "value": 58
}, {
  "date": "2013-01-01",
  "value": 60
}, {
  "date": "2013-01-02",
  "value": 67
}, {
  "date": "2013-01-03",
  "value": 64
}, {
  "date": "2013-01-04",
  "value": 66
}, {
  "date": "2013-01-05",
  "value": 60
}, {
  "date": "2013-01-06",
  "value": 63
}, {
  "date": "2013-01-07",
  "value": 61
}, {
  "date": "2013-01-08",
  "value": 60
}, {
  "date": "2013-01-09",
  "value": 65
}, {
  "date": "2013-01-10",
  "value": 75
}, {
  "date": "2013-01-11",
  "value": 77
}, {
  "date": "2013-01-12",
  "value": 78
}, {
  "date": "2013-01-13",
  "value": 70
}, {
  "date": "2013-01-14",
  "value": 70
}, {
  "date": "2013-01-15",
  "value": 73
}, {
  "date": "2013-01-16",
  "value": 71
}, {
  "date": "2013-01-17",
  "value": 74
}, {
  "date": "2013-01-18",
  "value": 78
}, {
  "date": "2013-01-19",
  "value": 85
}, {
  "date": "2013-01-20",
  "value": 82
}, {
  "date": "2013-01-21",
  "value": 83
}, {
  "date": "2013-01-22",
  "value": 88
}, {
  "date": "2013-01-23",
  "value": 85
}, {
  "date": "2013-01-24",
  "value": 85
}, {
  "date": "2013-01-25",
  "value": 80
}, {
  "date": "2013-01-26",
  "value": 87
}, {
  "date": "2013-01-27",
  "value": 84
}, {
  "date": "2013-01-28",
  "value": 83
}, {
  "date": "2013-01-29",
  "value": 84
}, {
  "date": "2013-01-30",
  "value": 81
}];

export default class Chart {
  _observer;

  _chart;
  _alarmsSeries;
  _measuresSeries = {};
  _timelineSeries;

  constructor(ref, startTime, endTime, observer) {
    this._initChart(ref, startTime, endTime);
    //this._initTimeline(startTime);
    this._initEvents();
    this._observer = observer;
  }

  _initChart(ref, startTime, endTime) {
    this._chart = am4core.create(ref, am4charts.XYChart);
    this._chart.colors.list = [
        am4core.color('#357AB7'),
        am4core.color('#99512B'),
        am4core.color('#6C0277')
    ];

    this._chart.scrollbarX = new am4charts.XYChartScrollbar();
    this._chart.scrollbarX.marginBottom = 20;

    this._chart.legend = new am4charts.Legend();
    this._chart.cursor = new am4charts.XYCursor();
    
    const dateAxis = this._chart.xAxes.push(new am4charts.DateAxis());
    //dateAxis.renderer.minGridDistance = 70;
    //dateAxis.baseInterval = { count: 1, timeUnit : 'millisecond' };
    //dateAxis.min = startTime;
    //dateAxis.max = endTime;
  }

  _initTimeline(startTime) {
    const valueAxis = this._chart.yAxes.push(new am4charts.ValueAxis());

    this._timelineSeries = this._chart.series.push(new am4charts.ColumnSeries());
    this._timelineSeries.dataFields.valueY = 'timeline';
    this._timelineSeries.dataFields.dateX = 'time';
    this._timelineSeries.strokeWidth = 2;
    this._timelineSeries.yAxis = valueAxis;
    this._timelineSeries.name = 'Timeline';
    this._timelineSeries.tooltipText = '{name}';
    this._timelineSeries.interpolationDuration = 500;
    this._timelineSeries.defaultState.transitionDuration = 0;
    this._timelineSeries.columns.template.width = am4core.percent(4);
    this._timelineSeries.data = [{
        time: startTime,
        timeline: 10
    }];
    this._timelineSeries.disabled = true;
    this._timelineSeries.fill = am4core.color('#59E82A');
    this._timelineSeries.stroke = am4core.color('#59E82A');

    valueAxis.visible = false;
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.opposite = true;
    valueAxis.interpolationDuration = 500;
    valueAxis.rangeChangeDuration = 500;
    valueAxis.min = 0;
    valueAxis.max = 5;
  }

  _initEvents() {
    this._chart.series.events.on('removed', () => {
      this._timelineSeries.disabled = true;
      this._chart.invalidateData();
    });
    this._chart.xAxes.events.on('extremeschanged', this._onScaleChange.bind(this));
    this._chart.scrollbarX.events.on('up', this._onScaleChange.bind(this));
  }

  createAlarms(alarms) {
    const valueAxis = this._chart.yAxes.push(new am4charts.ValueAxis());

    this._alarmsSeries = this._chart.series.push(new am4charts.ColumnSeries());
    this._alarmsSeries.dataFields.valueY = 'value';
    this._alarmsSeries.dataFields.dateX = 'time';
    this._alarmsSeries.strokeWidth = 2;
    this._alarmsSeries.yAxis = valueAxis;
    this._alarmsSeries.name = 'Alarm';
    this._alarmsSeries.tooltipHTML = AlarmTooltip;
    this._alarmsSeries.data = this._normalizeAlarms(alarms);
    this._alarmsSeries.columns.template.width = am4core.percent(4);
    this._alarmsSeries.columns.template.adapter.add('stroke', (stroke, target) => {
        return this._alarmColorPick(target);
    });
    this._alarmsSeries.columns.template.adapter.add('fill', (fill, target) => {
        return this._alarmColorPick(target);
    });

    valueAxis.renderer.line.strokeOpacity = 1;
    valueAxis.renderer.line.strokeWidth = 2;
    valueAxis.renderer.line.stroke = am4core.color('#000000');
    valueAxis.renderer.labels.template.fill = am4core.color('#000000');
    valueAxis.renderer.opposite = true;
    valueAxis.maxPrecision = 0;
    valueAxis.min = 0;
    valueAxis.max = 4;

    this._chart.scrollbarX.series.push(this._alarmsSeries);
  }

  addMeasure(measure, samples) {
    const valueAxis = this._chart.yAxes.push(new am4charts.ValueAxis());

    const series = this._chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'time';
    series.strokeWidth = 2;
    series.yAxis = valueAxis;
    series.name = measure.name;
    series.tooltipHTML = MeasureTooltip;
    series.tensionX = 1;
    series.minBulletDistance = 15;
    series.data = this._normalizeSamples(samples, measure.unit);
    //series.data = data;
    //series.fill = this._chart.colors.list[(this._chart.series.length - 3) % 3]; // -3 car on a Timeline, alarme de base
    //series.stroke = this._chart.colors.list[(this._chart.series.length - 3) % 3]; // %3 car on a que 3 couleurs max

    valueAxis.renderer.line.strokeOpacity = 1;
    valueAxis.renderer.line.strokeWidth = 2;
    valueAxis.renderer.line.stroke = series.stroke;
    valueAxis.renderer.labels.template.fill = series.stroke;
    valueAxis.renderer.opposite = false;
    valueAxis.maxPrecision = 0;

    this._measuresSeries[measure.id] = series;
  }

  removeMeasure(measure) {

  }

  destroy() {
    this._chart.dispose();
  }

  _alarmColorPick(target) {
    switch (target.dataItem.valueY) {
      case 1:
        return am4core.color('#787878');
      case 2:
        return am4core.color('#e8e800');
      case 3:
        return am4core.color('#ff0000');
      default:
        return am4core.color('#000000');
    }
  }

  _normalizeAlarms(alarms) {
    return alarms.map(alarm => ({
        value: alarm.level,
        ...alarm,
        time: new Date(alarm.time).setMilliseconds(alarm.time.getMilliseconds())
    }));
  }

  _normalizeSamples(samples, unit) {
    return samples.map(sample => {
      const min = sample.time.split(':')[0];
      const sec = sample.time.split(':')[1];
      const time = new Date();
      time.setMinutes(parseInt(min, 10));
      time.setSeconds(parseFloat(sec, 10))
      
      return {
        value: parseInt(sample.value, 10),
        time,
        unit
      }
    });
  }

  _onScaleChange() {
    const xAxis = this._chart.xAxes.getIndex(0);
    const start = this._chart.scrollbarX.range.start;
    const end = this._chart.scrollbarX.range.end;
    const startTime = xAxis.positionToDate(start);
    const endTime = xAxis.positionToDate(end);

    if ((startTime instanceof Date && isNaN(startTime)) || (endTime instanceof Date && isNaN(endTime))) {
       return;
    }

    if (this._observer) {
      this._observer.onScaleChange(startTime, endTime);
    }
  }
}
