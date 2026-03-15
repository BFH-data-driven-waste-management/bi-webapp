import { ChartOptions } from 'chart.js'; // FIXME is chart.js separately needed?

export function buildBaseBarOptions(): ChartOptions<'bar'> {
  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue('--p-content-background').trim(); // TODO maybe better option
  const border = style.getPropertyValue('--color-gray-600').trim();

  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: bg,
        titleColor: '#f8fafc', // TODO maybe use tailwind palette
        bodyColor: '#cbd5e1',
        borderColor: border,
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.raw} Eimer`,
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
