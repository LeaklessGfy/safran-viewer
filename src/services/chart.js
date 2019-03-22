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

export default class Chart {
  _date;
  _observer;
  _isZooming = false;

  _chart;
  _dateAxis;
  _alarmsSeries;
  _measuresSeries = {};
  _timelineSeries;

  constructor(ref, startDate, endDate, observer) {
    this._initChart(ref, startDate, endDate);
    this._initTime(startDate, endDate);
    this._initTimeline(startDate);
    this._initEvents();
    this._date = startDate;
    this._observer = observer;
  }

  _initChart(ref, startDate, endDate) {
    this._chart = am4core.create(ref, am4charts.XYChart);
    this._chart.colors.list = [
        am4core.color('#357AB7'),
        am4core.color('#99512B'),
        am4core.color('#6C0277')
    ];

    this._chart.scrollbarX = new am4charts.XYChartScrollbar();
    this._chart.scrollbarX.marginBottom = 20;
    //this._chart.scrollbarX.thumb.minWidth = 20;

    this._chart.legend = new am4charts.Legend();
    this._chart.cursor = new am4charts.XYCursor();
    
    this._dateAxis = this._chart.xAxes.push(new am4charts.DateAxis());
    this._dateAxis.baseInterval = { count: 1, timeUnit: 'second' };
    this._dateAxis.min = startDate;
    this._dateAxis.max = endDate;
    //dateAxis.renderer.minGridDistance = 70;
  }

  _initTime(startDate, endDate) {
    const valueAxis = this._chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 1;
    valueAxis.visible = false;

    const series = this._chart.series.push(new am4charts.ColumnSeries());
    series.name = 'Start & End';
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'time';
    series.strokeWidth = 1;
    series.yAxis = valueAxis;
    series.data = [
      { value: 1, time: startDate },
      { value: 1, time: endDate }
    ];
  }

  _initTimeline(startDate) {
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
        time: startDate,
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
      //this._timelineSeries.disabled = true;
      this._chart.invalidateData();
    });
    this._dateAxis.events.on('selectionextremeschanged', this._onScaleChange.bind(this));
    //this._chart.scrollbarX.events.on('up', this._onScaleChange.bind(this));
    //this._chart.events.on('globalscalechanged', this._onScaleChange.bind(this));
  }

  addAlarms(alarms) {
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
    if (samples.length < 1) {
      return;
    }

    const valueAxis = this._chart.yAxes.push(new am4charts.ValueAxis());
    const index = Object.keys(this._measuresSeries).length % 3;

    const series = this._chart.series.push(new am4charts.LineSeries());
    series.name = measure.name;
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'time';
    series.strokeWidth = 4;
    series.yAxis = valueAxis;
    series.tooltipHTML = MeasureTooltip;
    series.tensionX = 1;
    series.minBulletDistance = 15;
    series.data = this._normalizeSamples(samples, measure.unit);
    series.stroke = this._chart.colors.list[index]; // %3 car on a que 3 couleurs max
    series.fill = this._chart.colors.list[index];

    valueAxis.maxPrecision = 0;
    valueAxis.renderer.line.strokeOpacity = 1;
    valueAxis.renderer.line.strokeWidth = 2;
    valueAxis.renderer.line.stroke = series.stroke;
    valueAxis.renderer.labels.template.fill = series.fill;
    valueAxis.renderer.opposite = false;

    series.events.on('ready', () => {
      this._dateAxis.zoomToDates(
        series.data[0].time,
        series.data[series.data.length - 1].time
      );
    });

    this._measuresSeries[measure._id] = series;
  }

  removeMeasure(measure) {
    const series = this._measuresSeries[measure.id];
    if (!series) {
      return;
    }
    this._chart.series.removeValue(series);
    this._chart.yAxes.removeValue(series.yAxis);
    series.dispose();
    series.yAxis.dispose();
    delete this._measuresSeries[measure.id];
  }

  scaleOnMeasure(measure) {
    const series = this._measuresSeries[measure.id];
    if (!series) {
      return;
    }
    this._dateAxis.zoomToDates(
      series.data[0].time,
      series.data[series.data.length - 1].time
    );
  }

  zoom(startDate, endDate) {
    this._isZooming = true;
    this._dateAxis.zoomToDates(
      startDate,
      endDate,
      true,
      true
    );
    setTimeout(() => this._isZooming = false, 500);
  }

  destroy() {
    if (this._chart) {
      this._chart.dispose();
    }
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
    return alarms.map(alarm => {
      const time = new Date(this._date);
      time.setMilliseconds(alarm.time);

      return {
        value: alarm.level,
        ...alarm,
        time
      };
    });
  }

  _normalizeSamples(samples, unit) {
    return samples.map(sample => {
      const min = sample.time.split(':')[0];
      const sec = sample.time.split(':')[1];
      const milli = sec.split(',')[1];

      const time = new Date(this._date);
      time.setMinutes(parseInt(min, 10));
      time.setSeconds(parseInt(sec, 10));
      time.setMilliseconds(parseInt(milli, 10));

      return {
        value: parseInt(sample.value, 10),
        time,
        unit
      };
    });
  }

  _onScaleChange() {
    if (!this._observer || this._isZooming) {
      return;
    }

    const xAxis = this._chart.xAxes.getIndex(0);
    const start = this._chart.scrollbarX.range.start;
    const end = this._chart.scrollbarX.range.end;
    const startDate = xAxis.positionToDate(start);
    const endDate = xAxis.positionToDate(end);

    if (
      (startDate instanceof Date && isNaN(startDate))
      || (endDate instanceof Date && isNaN(endDate))
    ) {
      return;
    }

    this._observer.onScaleChange(startDate, endDate);
  }
}
