import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BinVisitVm, Column, FillLevel, TourDTO, TourTimelineItemVm } from '../tour.model';
import {
  BIN_TYPE_TAG_SEVERITY,
  BIN_VISIT_ACTION_LABELS,
  BIN_VISIT_ACTION_TAG_SEVERITIES,
  BIN_VISIT_FILL_LEVEL_LABELS,
  BIN_VISIT_FILL_LEVEL_TAG_CLASSES,
} from '../tour.presentation';
import { Card } from 'primeng/card';
import { ChartData } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { buildFillLevelPieOptions } from './chart-options';
import { Timeline } from 'primeng/timeline';
import { FormsModule } from '@angular/forms';
import { ToggleButton } from 'primeng/togglebutton';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { RouterLink } from '@angular/router';
import { Tag } from 'primeng/tag';
import { DateTimeService } from '../../shared/services/date-time.service';

@Component({
  selector: 'app-tour-details',
  imports: [
    Card,
    DatePipe,
    UIChart,
    Timeline,
    FormsModule,
    ToggleButton,
    TableModule,
    Button,
    Toolbar,
    RouterLink,
    Tag,
  ],
  templateUrl: './tour-details.html',
  styleUrl: './tour-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourDetails {
  readonly dateTimeService = inject(DateTimeService);
  readonly fillLevelPieOptions = buildFillLevelPieOptions();

  readonly tour = input.required<TourDTO>();

  /**
   * A (static) column definition is needed for the export
   */
  readonly columns: Column[] = [
    { field: 'id', header: 'ID' },
    { field: 'coordinatesLabel', header: 'Eimer (Koordinaten)' },
    { field: 'eventTimestampLabel', header: 'Zeitpunkt' },
    { field: 'binTypeLabel', header: 'Behältertyp' },
    { field: 'fillLevelLabel', header: 'Füllstand' },
    { field: 'visitActionLabel', header: 'Aktion' },
  ];

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
      // TODO maybe also outsource
      FillLevel.OVERFULL,
      FillLevel.FULL,
      FillLevel.HALF_FULL,
      FillLevel.EMPTY_OR_ALMOST_EMPTY,
    ];

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
    const gray = style.getPropertyValue(`--color-gray-900`);

    return {
      labels: order.map((level) => BIN_VISIT_FILL_LEVEL_LABELS[level]),
      datasets: [
        {
          data: order.map((level) => counts[level]),
          backgroundColor: (context) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              return style.getPropertyValue(`--color-red-200`);
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

  readonly binVisitRows = computed<BinVisitVm[]>(() =>
    this.tour().binVisits.map((visit) => ({
      ...visit,
      coordinatesLabel: `${visit.bin.coordX} / ${visit.bin.coordY}`,
      eventTimestampLabel: this.dateTimeService.format(visit.eventTimestamp),
      fillLevelLabel: BIN_VISIT_FILL_LEVEL_LABELS[visit.fillLevel],
      fillLevelClass: BIN_VISIT_FILL_LEVEL_TAG_CLASSES[visit.fillLevel],
      visitActionLabel: BIN_VISIT_ACTION_LABELS[visit.visitAction],
      visitActionSeverity: BIN_VISIT_ACTION_TAG_SEVERITIES[visit.visitAction],
    })),
  );

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

  // for usage in template
  protected readonly BIN_TYPE_TAG_SEVERITY = BIN_TYPE_TAG_SEVERITY;
}
