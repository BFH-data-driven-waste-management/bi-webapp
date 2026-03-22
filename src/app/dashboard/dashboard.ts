import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { buildBaseBarOptions } from './chart-options';
import { ChartData, ChartOptions, ScriptableContext } from 'chart.js'; // TODO chart.js needed?
import { BinService } from '../bin/bin.service';
import { BinDTO } from '../bin/bin.model';

@Component({
  selector: 'app-dashboard',
  imports: [Card, UIChart],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  bins = input.required<BinDTO[]>();

  readonly barOptions: ChartOptions<'bar'> = buildBaseBarOptions();

  readonly barData = computed<ChartData<'bar'>>(() => {
    const counts: Record<string, number> = {};

    for (const bin of this.bins()) {
      if (bin.type === 'TEST_BIN') {
        continue;
      }
      const type = bin.type?.trim() || 'Unknown';
      counts[type] = (counts[type] ?? 0) + 1;
    }

    const entries = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));

    return {
      labels: entries.map(([type]) => type),
      datasets: [
        {
          data: entries.map(([, count]) => count),
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 0,
            bottomRight: 0,
          },
          backgroundColor: (context: ScriptableContext<'bar'>) => {
            const style = getComputedStyle(document.documentElement);
            const gradientStart = style.getPropertyValue('--color-red-400').trim();
            const gradientEnd = style.getPropertyValue('--color-red-100').trim();

            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              return gradientEnd;
            }

            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

            gradient.addColorStop(0, gradientStart);
            gradient.addColorStop(1, gradientEnd);

            return gradient;
          },
        },
      ],
    };
  });
}
