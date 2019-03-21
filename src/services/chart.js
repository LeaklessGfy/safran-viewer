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
    
    /*
    this._chart.scrollbarX = new am4charts.XYChartScrollbar();
    this._chart.scrollbarX.marginBottom = 20;
    */

    this._chart.legend = new am4charts.Legend();
    this._chart.cursor = new am4charts.XYCursor();
    
    const dateAxis = this._chart.xAxes.push(new am4charts.DateAxis());
    //dateAxis.renderer.minGridDistance = 70;
    dateAxis.baseInterval = { count: 1, timeUnit : 'millisecond' };
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
    //this._chart.scrollbarX.events.on('up', this._onScaleChange.bind(this));
  }

  createAlarms(alarms) {
    const valueAxis = this._chart.yAxes.push(new am4charts.ValueAxis());

    this._alarmsSeries = this._chart.series.push(new am4charts.ColumnSeries());
    this._alarmsSeries.dataFields.valueY = 'alarm';
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
    console.log(measure, samples);
    const valueAxis = this._chart.yAxes.push(new am4charts.ValueAxis());

    const series = this._chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = measure.name;
    series.dataFields.dateX = 'time';
    series.strokeWidth = 2;
    series.yAxis = valueAxis;
    series.name = measure.name;
    series.tooltipHTML = MeasureTooltip;
    series.tensionX = 1;
    series.data = this._normalizeSamples(measure.name, measure.unit, samples);
    series.fill = this._chart.colors.list[(this._chart.series.length - 3) % 3]; // -3 car on a Timeline, alarme de base
    series.stroke = this._chart.colors.list[(this._chart.series.length - 3) % 3]; // %3 car on a que 3 couleurs max
    console.log(series.data);

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
        alarm: alarm.level,
        ...alarm,
        time: new Date(alarm.time).setMilliseconds(alarm.time.getMilliseconds())
    }));
  }

  _normalizeSamples(name, unit, samples) {
    return samples.map(sample => {
      const min = sample.time.split(':')[0];
      const sec = sample.time.split(':')[1];
      const time = new Date();
      time.setMinutes(parseInt(min, 10));
      time.setSeconds(parseFloat(sec, 10))
      
      return {
        time: time,
        [name]: parseInt(sample.value, 10),
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
