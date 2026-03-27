import { ChartOptions } from 'chart.js';

type FillLevelOptionsArgs = {
  weekInMs: number;
  formatDate: (timestamp: number) => string;
  toFillLevelLabel: (fillLevelRank: number) => string;
};

export function buildFillLevelOptions({
  weekInMs,
  formatDate,
  toFillLevelLabel,
}: FillLevelOptionsArgs): ChartOptions<'line'> {
  const style = getComputedStyle(document.documentElement);
  const gray = style.getPropertyValue('--color-gray-600').trim();
  const bg = style.getPropertyValue('--p-content-background').trim();

  return {
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 3,
        ticks: {
          stepSize: 1,
          color: gray,
          callback: (value) => toFillLevelLabel(value as number),
        },
        grid: {
          color: style.getPropertyValue('--p-content-border-color').trim(),
        },
      },
      x: {
        type: 'linear',
        ticks: {
          color: gray,
          autoSkip: true,
          stepSize: weekInMs,
          callback: (value) => formatDate(value as number),
        },
        grid: {
          color: style.getPropertyValue('--p-content-border-color').trim(),
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: bg,
        titleColor: gray,
        bodyColor: gray,
        borderColor: gray,
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (contexts) => formatDate((contexts[0].parsed.x as number)),
          label: (context) => toFillLevelLabel(context.parsed.y as number),
        },
      },
    },
  };
}
