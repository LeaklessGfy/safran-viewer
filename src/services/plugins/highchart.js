import * as Highcharts from 'highcharts';
import { epochToString } from '../date';
import { COLORS, GREEN } from '@/plugins/ui/highchart';

export const createChart = (ref, experiment, currentDate) => {
  const min = experiment.startDate;
  const max = experiment.endDate;
  const observers = {
    onClick: []
  };
  const timeAxis = {
    min: 0,
    max: 1,
    visible: false,
    crosshair: {
      snap: false
    }
  };
  const timeSeries = {
    type: 'column',
    name: 'Time',
    yAxis: 0,
    color: GREEN,
    data: [[currentDate, 1]]
  };

  const chart = Highcharts.chart(ref, {
    chart: {
      zoomType: 'x',
      events: {
        click: function (e) {
          const x = e.xAxis[0].value;
          observers.onClick.forEach(o => o(x));
        }
      }
    },
    title: {
      text: experiment.name
    },
    subtitle: {
      text: epochToString(experiment.startDate) + ' - ' + epochToString(experiment.endDate)
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: true
    },
    tooltip: {
      shared: true,
      xDateFormat: '%H:%M:%S.%L'
    },
    xAxis: {
      type: 'datetime',
      min,
      max,
      crosshair: {
        snap: false
      },
      minPadding: 0,
      maxPadding: 0
    },
    yAxis: [timeAxis],
    series: [timeSeries]
  });

  return {
    scale() {
      chart.reflow();
    },
    addOnClickObserver(observer) {
      if (typeof observer !== 'function') {
        throw new Error('OnClickObsever requires to be a function');
      }
      observers.onClick.push(observer);
    },
    addMeasure(measure, samples) {
      const axis = chart.get(measure.type + measure.unit);
      const index = axis ? axis.userOptions.index : chart.yAxis.length;
      if (!axis) {
        chart.addAxis(addAxis(index, measure));
      }
      chart.addSeries(addSeries(index, measure, samples));
    },
    addAlarm(alarm) {
      chart.xAxis[0].addPlotLine(addPlotLine(alarm));
    },
    addModification(modification) {
      const index = chart.xAxis[0].plotLinesAndBands.length;
      chart.xAxis[0].addPlotBand(addPlotBand(index, modification));
    },
    setTime(time, duration = 100) {
      chart.series[0].points[0].update({ x: time }, true, { duration });
    },
    cleanMeasures() {
      const toRemove = [];
      for (let i = 1; i < chart.yAxis.length; i++) {
        toRemove.push(chart.yAxis[i]);
      }
      for (const axes of toRemove) {
        axes.remove();
      }
      chart.redraw();
    },
    cleanAlarms() {
      const toRemove = [];
      for (const plotLine of chart.xAxis[0].plotLinesAndBands) {
        toRemove.push(plotLine.id);
      }
      for (const id of toRemove) {
        chart.xAxis[0].removePlotLine(id);
      }
      chart.redraw();
    },
    cleanModifications() {
      const toRemove = [];
      for (const plotBand of chart.xAxis[0].plotLinesAndBands) {
        toRemove.push(plotBand.id);
      }
      for (const id of toRemove) {
        chart.xAxis[0].removePlotBand(id);
      }
      chart.redraw();
    },
    destroy() {
      chart.destroy();
    }
  };
};

const formatData = samples => samples.map(sample => [sample.time.getTime(), parseFloat(sample.value.replace(',', '.'))]);

const addAxis = (index, measure) => ({
  id: measure.type + measure.unit,
  labels: {
    format: '{value} ' + measure.unit,
    style: {
      color: COLORS[index - 1]
    }
  },
  title: {
    text: measure.type,
    style: {
      color: COLORS[index - 1]
    }
  }
});

const addSeries = (index, measure, samples) => ({
  type: 'areaspline',
  name: measure.name,
  yAxis: index,
  tooltip: {
    valueSuffix: ' ' + measure.unit
  },
  color: COLORS[index - 1],
  data: formatData(samples)
});

const addPlotLine = alarm => ({
  id: alarm.id,
  color: 'red', // get color from alarm level
  dashStyle: 'ShortDash',
  width: 2,
  value: alarm.time.getTime(),
  label: {
    text: alarm.message,
    rotation: 360,
    x: -30
  }
});

const addPlotBand = (index, modification) => ({
  id: modification._id,
  borderColor: COLORS[index + 1],
  borderWidth: 2,
  zIndex: index,
  from: modification.startDate,
  to: modification.endDate,
  label: {
    text: modification.operation + ' : ' + modification.value
  }
});
