import * as Highcharts from 'highcharts';
import { dateToString } from '../date';
import { COLORS, GREEN } from '@/plugins/ui/highchart';

export const createChart = (ref, experiment) => {
  const min = new Date(experiment.startDate).getTime();
  const max = new Date(experiment.endDate).getTime();
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
    data: [[min, 1]]
  };

  const chart = Highcharts.chart(ref, {
    chart: {
      zoomType: 'x',
      events: {
        click: function (e) {
          const x = e.xAxis[0].value;
          const date = new Date(x);
          chart.series[0].points[0].update({ x }, true, { duration: 300 });
          observers.onClick.forEach(o => o(date));
        }
      }
    },
    title: {
      text: experiment.name
    },
    subtitle: {
      text: dateToString(experiment.startDate) + ' - ' + dateToString(experiment.endDate)
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
      chart.xAxis[0].addPlotBand(addPlotBand(modification));
    },
    setTime(time) {
      chart.series[0].points[0].update({ x: time }, true, { duration: 300 });
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

const addPlotBand = modification => ({
  color: COLORS[2],
  from: modification.startDate.getTime(),
  to: modification.endDate.getTime(),
  label: {
    text: modification.title
  }
});
