import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FillLevel, TourDTO, TourTimelineItemVm } from '../tour.model';
import { Card } from 'primeng/card';
import { ChDateTimePipe } from '../../shared/pipes/ch-date-time.pipe';
import { ChartData } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { buildFillLevelPieOptions } from './chart-options';
import { Timeline } from 'primeng/timeline';
import { FormsModule } from '@angular/forms';
import { ToggleButton } from 'primeng/togglebutton';

@Component({
  selector: 'app-tour-details',
  imports: [Card, ChDateTimePipe, UIChart, Timeline, FormsModule, ToggleButton],
  templateUrl: './tour-details.html',
  styleUrl: './tour-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourDetails {
  readonly fillLevelPieOptions = buildFillLevelPieOptions();

  readonly tour = input.required<TourDTO>();

  readonly timelineWithMueve = signal(false);

  readonly timeline = computed<TourTimelineItemVm[]>(() => {
    const tour = this.tour();

    const items: TourTimelineItemVm[] = [
      {
        action: 'Tourstart',
        timestamp: tour.startedAt,
      },
    ];

    if (this.timelineWithMueve()) {
      const sortedEmptyings = [...tour.vehicleEmptyings]
        .sort(
          (a, b) =>
            new Date(a.emptyingTimestamp).getTime() - new Date(b.emptyingTimestamp).getTime(),
        )
        .map((emptying) => ({
          action: 'Müve',
          timestamp: emptying.emptyingTimestamp,
        }));

      items.push(...sortedEmptyings);
    }

    if (tour.endedAt) {
      items.push({
        action: 'Tourende',
        timestamp: tour.endedAt,
      });
    }

    return items;
  });

  readonly emptyingsCount = computed(
    () => this.tour().binVisits.filter((visit) => visit.visitAction === 'EMPTIED').length,
  );

  readonly overfullBins = computed(
    () => this.tour().binVisits.filter((visit) => visit.fillLevel === 'OVERFULL').length,
  );

  readonly fillLevelPieData = computed<ChartData<'pie'>>(() => {
    const order: FillLevel[] = [
      // TODO maybe outsource
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
              this.createPieGradient(
                ctx,
                chartArea,
                style.getPropertyValue(`--color-gray-900`),
                style.getPropertyValue(`--color-gray-500`),
              ),
              this.createPieGradient(
                ctx,
                chartArea,
                style.getPropertyValue(`--color-red-600`),
                style.getPropertyValue(`--color-red-300`),
              ),
              this.createPieGradient(
                ctx,
                chartArea,
                style.getPropertyValue(`--color-red-300`),
                style.getPropertyValue(`--color-red-200`),
              ),
              this.createPieGradient(
                ctx,
                chartArea,
                style.getPropertyValue(`--color-gray-300`),
                style.getPropertyValue(`--color-gray-200`),
              ),
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
