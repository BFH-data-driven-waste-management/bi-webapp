import { formatPercent } from '@angular/common';
import { ChartOptions, TooltipItem } from 'chart.js';
import { LOCALE } from '../../shared/constants/constants';
import { buildCommonTooltipOptions } from '../../shared/charts/common-options';

function toNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function getTotalValue(context: TooltipItem<'pie'>): number {
  return context.dataset.data.reduce((sum, value) => sum + toNumber(value), 0);
}

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
          label: (context) => {
            const absolute = toNumber(context.raw);
            const total = getTotalValue(context);
            const percent = total > 0 ? absolute / total : 0;
            const formattedPercent = formatPercent(percent, LOCALE, '1.0-1');

            return `Anz.: ${absolute} (${formattedPercent})`;
          },
        },
      },
    },
  };
}
