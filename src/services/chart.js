import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { addMilliseconds } from 'date-fns';
import { dateToTime } from './date';

am4core.useTheme(am4themes_animated);

const TimeTooltip = `<center><strong>{legend}</strong></center>`;

const AlarmTooltip = `<center><strong>{name}</strong></center>
<table>
<tr><th align="left">Level</th><td>{valueY}</td></tr>
<tr><th align="left">Message</th><td>{message}</td></tr>
</table>`;

const MeasureTooltip = `<center><strong>{name}</strong><br><b>{valueY}&nbsp;{unit}</b></center>`;

export default class ChartService {
  _date;
  _observer;
  _isZooming = false;
  _position = null;

  _chart;
  _dateAxis;
  _alarmsSeries;
  _measuresSeries = {};
  _timelineSeries;
  _timeSeries;

  constructor(ref, startDate, endDate, observer) {
    this._initChart(ref);
    this._initTime();
    this._initTimeline();
    this._initEvents();
    this._observer = observer;
    this.rescale(startDate, endDate);
  }

  _initChart(ref) {
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
    this._chart.cursor.maxPanOut = 0;

    this._dateAxis = this._chart.xAxes.push(new am4charts.DateAxis());
    this._dateAxis.baseInterval = { count: 1, timeUnit: 'second' };
  }

  _initTime() {
    const valueAxis = this._chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 1;
    valueAxis.visible = false;

    this._timeSeries = this._chart.series.push(new am4charts.ColumnSeries());
    this._timeSeries.name = 'Start & End';
    this._timeSeries.dataFields.valueY = 'value';
    this._timeSeries.dataFields.dateX = 'time';
    this._timeSeries.strokeWidth = 1;
    this._timeSeries.yAxis = valueAxis;
    this._timeSeries.tooltipHTML = TimeTooltip;
  }

  _initTimeline() {
    const valueAxis = this._chart.yAxes.push(new am4charts.ValueAxis());

    this._timelineSeries = this._chart.series.push(new am4charts.ColumnSeries());
    this._timelineSeries.dataFields.valueY = 'timeline';
    this._timelineSeries.dataFields.dateX = 'time';
    //this._timelineSeries.strokeWidth = 2;
    this._timelineSeries.yAxis = valueAxis;
    this._timelineSeries.name = 'Timeline';
    this._timelineSeries.tooltipText = '{name}';
    //this._timelineSeries.interpolationDuration = 500;
    this._timelineSeries.defaultState.transitionDuration = 0;
    //this._timelineSeries.columns.template.width = am4core.percent(4);
    this._timelineSeries.fill = am4core.color('#59E82A');
    this._timelineSeries.stroke = am4core.color('#59E82A');

    valueAxis.visible = false;
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.opposite = true;
    //valueAxis.interpolationDuration = 500;
    //valueAxis.rangeChangeDuration = 500;
    valueAxis.min = 0;
    valueAxis.max = 5;
  }

  _initEvents() {
    this._chart.series.events.on('removed', () => {
      this._chart.invalidateData();
    });
    this._dateAxis.events.on('selectionextremeschanged', this._onScaleChange.bind(this));
    this._chart.legend.itemContainers.template.events.on('doublehit', ev => {
      this.scaleOnSeries(ev.target.dataItem.dataContext);
    });
    this._chart.cursor.events.on('cursorpositionchanged', ev => {
      const axisPos = this._dateAxis.toAxisPosition(ev.target.xPosition);
      this._position = this._dateAxis.positionToDate(axisPos);
    });
    this._chart.events.on('doublehit', () => {
      if (!this._observer) {
        return;
      }
      this._observer.onDateClick(this._position);
      this._timelineSeries.data[0].time = this._position;
      this._timelineSeries.invalidateData();
    });
    this._chart.events.on('track', ev => {
      if (!this._dateAxis.axisRanges) { // Check if this._position in range
        this._chart.cursor.tooltipText = dateToTime(this._position);
        this._chart.cursor.tooltipPosition = 'pointer';
        this._chart.cursor.showTooltip(ev.point);
      }
    });
    this._chart.cursor.events.on('selectstarted', () => {
      this._selectStart = new Date(this._position);
    });
    this._chart.cursor.events.on('selectended', () => {
      //var range = dateAxis.createSeriesRange(series); ON SERIES
      this._dateAxis.axisRanges.clear();

      const range = this._dateAxis.axisRanges.create();
      range.date = this._selectStart;
      range.endDate = new Date(this._position);
      range.axisFill.stroke = am4core.color('#396478');
      range.axisFill.fill = am4core.color('#396478');
      range.axisFill.fillOpacity = 0.3;
      range.axisFill.tooltipText = `Range:\n[bold]${dateToTime(this._selectStart)}[/] to [bold]${dateToTime(this._position)}[/]`;
      range.axisFill.interactionsEnabled = true;
      range.axisFill.isMeasured = true;
    });
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

    const bullet = series.bullets.push(new am4charts.CircleBullet());
    const bullethover = bullet.states.create('hover');
    bullethover.properties.scale = 1.3;

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
    this.scaleOnSeries(series);
  }

  scaleOnSeries(series) {
    this.zoom(series.data[0].time, series.data[series.data.length - 1].time);
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

  changeMode(mode) {
    switch (mode) {
      case 'zoom':
        this._chart.cursor.behavior = 'zoomX';
        break;
      case 'select':
        this._chart.cursor.behavior = 'selectX';
        break;
      case 'move':
        this._chart.cursor.behavior = 'panX';
        break;
    }
  }

  rescale(startDate, endDate) {
    this._date = startDate;
    this._dateAxis.min = startDate;
    this._dateAxis.max = endDate;
    this._timeSeries.data = [
      { value: 1, time: startDate, legend: 'Start' },
      { value: 1, time: endDate, legend: 'End' }
    ];
    this._timelineSeries.data = [{
      time: startDate,
      timeline: 10
    }];
    this._chart.invalidateData();
  }

  startTimeline(currentDate) {
    this._timelineSeries.data[0].time = currentDate;
    this._chart.scrollbarX.interactionsEnabled = false;
    this._chart.interactionsEnabled = false;
    this._timelineSeries.disabled = false;
  }

  tickTimeline(speed) {
    const oldTime = this._timelineSeries.data[0].time;
    const newTime = addMilliseconds(oldTime, speed);
    this._timelineSeries.data[0].time = newTime;
    this._timelineSeries.invalidateData();

    return newTime;
  }

  pauseTimeline() {
    this._chart.scrollbarX.interactionsEnabled = true;
    this._chart.interactionsEnabled = true;
  }

  stopTimeline() {
    this.pauseTimeline();
    this._timelineSeries.data[0].time = this._date;
    this._timelineSeries.invalidateData();
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
      return {
        value: alarm.level,
        message: alarm.message,
        time: alarm.time
      };
    });
  }

  _normalizeSamples(samples, unit) {
    return samples.map(sample => {
      return {
        value: parseInt(sample.value, 10),
        time: sample.time,
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
