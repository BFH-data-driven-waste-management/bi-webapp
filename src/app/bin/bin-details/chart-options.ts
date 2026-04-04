import { ChartOptions } from 'chart.js';

type FillTrendOptionsArgs = {
  toFillLevelLabel: (fillLevelScore: number) => string;
};

export function buildFillTrendOptions({
  toFillLevelLabel,
}: FillTrendOptionsArgs): ChartOptions<'line'> {
  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue('--p-content-background').trim();
  const gray = style.getPropertyValue('--color-gray-600').trim();

  return {
    responsive: true,
    maintainAspectRatio: false,
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
        ticks: {
          color: gray,
          maxRotation: 0,
          minRotation: 0,
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
          color: gray,
          callback: (value) => toFillLevelLabel(value as number),
        },
      },
    },
  };
}
