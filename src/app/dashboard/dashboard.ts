import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { BinDTO } from '../bin/bin.dto';
import { buildBaseBarOptions } from './chart-options';
import { ChartData, ChartOptions, ScriptableContext } from 'chart.js'; // TODO chart.js needed?
import { toSignal } from '@angular/core/rxjs-interop';
import { BinService } from '../bin/bin.service';

@Component({
  selector: 'app-dashboard',
  imports: [Card, UIChart],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  private readonly binService = inject(BinService);

  readonly bins = toSignal(this.binService.getBins(), { initialValue: [] as BinDTO[] });

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
            const gradientStart = style.getPropertyValue('--color-sky-700').trim();
            const gradientEnd = style.getPropertyValue('--color-sky-400').trim();

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
