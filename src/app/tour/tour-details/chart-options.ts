import { ChartOptions } from 'chart.js';
import { buildCommonTooltipOptions } from '../../shared/charts/common-options';

export function buildFillLevelPieOptions(): ChartOptions<'pie'> {
  const commonTooltip = buildCommonTooltipOptions();

  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        ...commonTooltip,
        callbacks: {
          label: (context) => `Abs.: ${context.raw}`, // TODO display percentage?
        },
      },
    },
  };
}
