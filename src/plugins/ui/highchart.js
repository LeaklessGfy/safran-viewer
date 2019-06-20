import * as Highcharts from 'highcharts';

export const PINK = '#F92672';
export const BLUE = '#66D9EF';
export const ORANGE = '#F36C12';
export const GREEN = '#44EA2C';
export const PURPLE = '#791E94';
export const DARK_BLUE = '#7cb5ec';
export const DARK_RED = '#F92627';
export const DARK_GREY = '#30353F';
export const DARK = '#2D3035';
export const BLACK = 'rgba(0, 0, 0, 0.85)';
export const GREY = '#A2A39C';
export const WHITE = '#F0F0F0';

export const COLORS = [
  PINK,
  BLUE,
  ORANGE,
  GREEN,
  PURPLE,
  DARK_BLUE,
  DARK_RED,
  DARK_GREY
];

Highcharts.theme = {
  COLORS,
  chart: {
    backgroundColor: DARK,
    style: {
      color: GREY
    }
  },
  tooltip: {
    backgroundColor: BLACK,
    style: {
      color: WHITE
    }
  },
  title: {
    style: {
      color: WHITE
    },
    align: 'center'
  },
  subtitle: {
    style: {
      color: GREY
    },
    align: 'center'
  },
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    itemStyle: {
      fontWeight: 'normal',
      color: GREY
    },
    itemHoverStyle: {
      color: WHITE
    }
  },
  xAxis: {
    gridLineDashStyle: 'ShortDot',
    gridLineWidth: 1,
    gridLineColor: GREY,
    lineColor: GREY,
    minorGridLineColor: GREY,
    tickColor: GREY,
    tickWidth: 1
  },
  yAxis: {
    gridLineDashStyle: 'ShortDot',
    gridLineWidth: 1,
    gridLineColor: GREY,
    lineColor: GREY,
    minorGridLineColor: GREY,
    tickColor: GREY,
    tickWidth: 1
  },
  plotOptions: {
    column: {
      borderWidth: 0,
      pointWidth: 2
    },
    areaspline: {
      fillColor: {
        linearGradient: {
          x1: 0,
          y1: 1,
          x2: 0,
          y2: 0
        },
        stops: [
          [0, DARK_BLUE],
          [1, Highcharts.Color(DARK_BLUE).setOpacity(0.1).get('rgba')]
        ]
      },
      lineWidth: 2,
      states: {
        hover: {
          lineWidth: 3
        }
      },
      threshold: null
    }
  }
};

Highcharts.setOptions(Highcharts.theme);
