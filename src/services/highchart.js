import * as Highcharts from 'highcharts';

export const createChart = (ref, experiment) => {
  const chart = Highcharts.chart(ref, {
    chart: {
      zoomType: 'x'
    },
    title: {
      text: experiment.name
    },
    subtitle: {
      text: experiment.startDate + ' ' + experiment.endDate
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: true
    },
    xAxis: {
      type: 'datetime',
      min: new Date(experiment.startDate).getTime(),
      max: new Date(experiment.endDate).getTime(),
      crosshair: {
        snap: false
      },
      minPadding: 0,
      maxPadding: 0
    },
    yAxis: [],
    series: []
  });

  const colors = Highcharts.getOptions().colors;

  return {
    addSeries(measure, samples) {
      const index = chart.yAxis.length;
      chart.addAxis({
        labels: {
          format: '{value} ' + measure.unit,
          style: {
            color: colors[index % colors.length]
          }
        },
        title: {
          text: measure.type,
          style: {
            color: colors[index % colors.length]
          }
        }
      });
      chart.addSeries({
        type: 'areaspline',
        name: measure.name,
        yAxis: index,
        data: samples // [[date, value]]
      });
    }
  };
};

/*
const chart = Highcharts.chart("chart", {
  chart: {
    zoomType: "x"
  },
  title: {
    text: "Measures"
  },
  subtitle: {
    text: ""
  },
  xAxis: {
    type: "datetime",
    min: new Date("2019-03-01").getTime(),
    max: new Date("2019-03-02").getTime(),
    crosshair: {
      snap: false
    }
  },
  yAxis: [
    {
      title: {
        text: "Value"
      }
    },
    {
      labels: {
        format: "{value}°C",
        style: {
          color: Highcharts.getOptions().colors[2]
        }
      },
      title: {
        text: "toto",
        style: {
          color: Highcharts.getOptions().colors[2]
        }
      }
    }
  ],
  series: [
    {
      type: "areaspline",
      name: "Measure 1",
      yAxis: 1,
      data: data
    }
  ]
});
*/
