import { ChartOptions } from 'chart.js';

export function buildFillLevelPieOptions(): ChartOptions<'pie'> {
  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue('--p-content-background').trim();
  const gray = style.getPropertyValue('--color-gray-600').trim();

  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          color: gray,
        },
      },
      tooltip: {
        backgroundColor: bg,
        titleColor: gray,
        bodyColor: gray,
        borderColor: gray,
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        callbacks: {
          label: (context) => `${context.raw}`,
        },
      },
    },
  };
}
