import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { Skeleton } from 'primeng/skeleton';
import { buildBaseBarOptions } from './chart-options';
import { ChartData, ChartOptions, ScriptableContext } from 'chart.js';
import { DashboardResponseDTO } from './dashboard.model';
import { SimpleMetricCard } from '../shared/components/simple-metric-card/simple-metric-card';
import { TrendMetricCard } from '../shared/components/trend-metric-card/trend-metric-card';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [Card, UIChart, Skeleton, SimpleMetricCard, TrendMetricCard],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly dashboardData = signal<DashboardResponseDTO | null>(null);

  readonly barOptions: ChartOptions<'bar'> = buildBaseBarOptions();

  readonly barData = computed<ChartData<'bar'>>(() => {
    const dashboard = this.dashboardData();
    if (!dashboard) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    const entries = [...dashboard.installedBins.countOfBinType]
      .filter((entry) => entry.type !== 'TEST_BIN')
      .sort((a, b) => a.type.localeCompare(b.type));

    return {
      labels: entries.map((entry) => entry.type),
      datasets: [
        {
          data: entries.map((entry) => entry.count),
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

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (dashboardResponse) => {
        this.dashboardData.set(dashboardResponse);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
