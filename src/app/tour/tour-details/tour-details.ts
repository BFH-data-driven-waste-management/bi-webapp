import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FillLevel, TourDTO } from '../tour.model';
import { Card } from 'primeng/card';
import { ChDateTimePipe } from '../../shared/pipes/ch-date-time.pipe';
import { ChartData } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { buildFillLevelPieOptions } from './chart-options';

@Component({
  selector: 'app-tour-details',
  imports: [Card, ChDateTimePipe, UIChart],
  templateUrl: './tour-details.html',
  styleUrl: './tour-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourDetails {
  readonly fillLevelPieOptions = buildFillLevelPieOptions();

  tour = input.required<TourDTO>();

  emptyingsCount = computed(
    () => this.tour().binVisits.filter((visit) => visit.visitAction === 'EMPTIED').length,
  );

  overfullBins = computed(
    () => this.tour().binVisits.filter((visit) => visit.fillLevel === 'OVERFULL').length,
  );

  readonly fillLevelPieData = computed<ChartData<'pie'>>(() => {
    const order: FillLevel[] = [ // TODO maybe outsource
      FillLevel.OVERFULL,
      FillLevel.FULL,
      FillLevel.HALF_FULL,
      FillLevel.EMPTY_OR_ALMOST_EMPTY,
    ];

    const labels: Record<FillLevel, string> = {
      OVERFULL: 'Übervoll',
      FULL: 'Voll',
      HALF_FULL: 'Halbvoll',
      EMPTY_OR_ALMOST_EMPTY: 'Leer oder fast leer',
    };

    const counts = {
      [FillLevel.OVERFULL]: 0,
      [FillLevel.FULL]: 0,
      [FillLevel.HALF_FULL]: 0,
      [FillLevel.EMPTY_OR_ALMOST_EMPTY]: 0,
    } satisfies Record<FillLevel, number>;

    for (const visit of this.tour()?.binVisits ?? []) {
      counts[visit.fillLevel]++;
    }

    const style = getComputedStyle(document.documentElement);
    const col = (className: string) => style.getPropertyValue(`--color-${className}`).trim();
    const gray = col('gray-900');

    return {
      labels: order.map((level) => labels[level]),
      datasets: [
        {
          data: order.map((level) => counts[level]),
          backgroundColor: (context) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              return col('red-200');
            }

            const redGradients = [
              this.createPieGradient(ctx, chartArea, col('gray-900'), col('gray-500')),
              this.createPieGradient(ctx, chartArea, col('red-600'), col('red-300')),
              this.createPieGradient(ctx, chartArea, col('red-300'), col('red-200')),
              this.createPieGradient(ctx, chartArea, col('gray-300'), col('gray-200')),
            ];

            return redGradients[context.dataIndex];
          },
          hoverBackgroundColor: [gray, gray, gray, gray],
          borderWidth: 0,
        },
      ],
    };
  });

  private createPieGradient(
    ctx: CanvasRenderingContext2D,
    chartArea: { top: number; bottom: number },
    start: string,
    end: string,
  ): CanvasGradient {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    return gradient;
  }
}
