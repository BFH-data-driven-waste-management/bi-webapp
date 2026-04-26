import { TooltipOptions } from 'chart.js';

export function buildCommonTooltipOptions(): Partial<TooltipOptions<any>> {
  const style = getComputedStyle(document.documentElement);
  const backgroundColor = style.getPropertyValue('--p-content-background').trim();
  const color = style.getPropertyValue('--color-gray-600').trim();

  return {
    backgroundColor,
    titleColor: color,
    bodyColor: color,
    borderColor: color,
    borderWidth: 1,
    cornerRadius: 10,
    padding: 12,
  };
}
