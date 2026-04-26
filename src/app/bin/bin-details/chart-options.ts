import { ChartOptions } from 'chart.js';
import { buildCommonTooltipOptions } from '../../shared/charts/common-options';

type FillTrendOptionsArgs = {
  toFillLevelLabel: (fillLevelScore: number) => string;
};

export function buildFillTrendOptions({
  toFillLevelLabel,
}: FillTrendOptionsArgs): ChartOptions<'line'> {
  const commonTooltip = buildCommonTooltipOptions();

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        ...commonTooltip,
        displayColors: false,
        callbacks: {
          label: (context) => toFillLevelLabel(context.parsed.y as number),
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: 1,
        border: {
          display: false,
        },
        ticks: {
          stepSize: 1 / 3,
          callback: (value) => toFillLevelLabel(value as number),
        },
      },
    },
  };
}

export function buildDailyFrequencyOptions(): ChartOptions<'line'> {
  const commonTooltip = buildCommonTooltipOptions();

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        ...commonTooltip,
        displayColors: false,
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
  };
}
