import { ChartOptions } from 'chart.js';
import { buildCommonTooltipOptions } from '../shared/charts/common-options';

export function buildBaseBarOptions(): ChartOptions<'bar'> {
  const commonTooltip = buildCommonTooltipOptions();

  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        ...commonTooltip,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.raw} Behälter`,
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
