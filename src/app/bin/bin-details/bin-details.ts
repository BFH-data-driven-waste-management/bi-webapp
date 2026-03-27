import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { BinDetailsDTO } from '../bin.model';
import { BIN_VISIT_FILL_LEVEL_LABELS } from '../../tour/tour.presentation';
import { FillLevel } from '../../tour/tour.model';
import { ChartData, ChartOptions, ScriptableContext } from 'chart.js';
import { ChDateTimeService } from '../../shared/pipes/ch-date-time.service';
import { buildFillLevelOptions } from './chart-options';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { lv95ToLatLng } from '../../shared/maps/coordinates';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // TODO maybe outsource
const FILL_LEVEL_BY_RANK: FillLevel[] = [
  FillLevel.EMPTY_OR_ALMOST_EMPTY,
  FillLevel.HALF_FULL,
  FillLevel.FULL,
  FillLevel.OVERFULL,
];
const FILL_LEVEL_RANK: Record<FillLevel, number> = {
  [FillLevel.EMPTY_OR_ALMOST_EMPTY]: 0,
  [FillLevel.HALF_FULL]: 1,
  [FillLevel.FULL]: 2,
  [FillLevel.OVERFULL]: 3,
};
@Component({
  selector: 'app-bin-details',
  imports: [Card, UIChart, GoogleMap, MapAdvancedMarker],
  templateUrl: './bin-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinDetails {
  readonly chDateTimeService = inject(ChDateTimeService);
  readonly bin = input.required<BinDetailsDTO>();
  readonly binPosition = computed(() => lv95ToLatLng(this.bin().coordX, this.bin().coordY));

  readonly mapOptions: google.maps.MapOptions = {
    zoom: 17,
    minZoom: 12,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    rotateControl: false,
    cameraControl: false,
    keyboardShortcuts: false,
    mapId: 'BIN_DETAILS_MAP_ID',
  };

  readonly fillLevelOptions: ChartOptions<'line'> = buildFillLevelOptions({
    weekInMs: WEEK_IN_MS,
    formatDate: (timestamp) => this.chDateTimeService.format(new Date(timestamp), 'date'),
    toFillLevelLabel: (fillLevelRank) =>
      BIN_VISIT_FILL_LEVEL_LABELS[FILL_LEVEL_BY_RANK[fillLevelRank]],
  });

  readonly fillLevelData = computed<ChartData<'line'>>(() => {
    const visits = [...(this.bin().visits ?? [])].sort(
      (a, b) => new Date(a.eventTimestamp).getTime() - new Date(b.eventTimestamp).getTime(),
    );

    const style = getComputedStyle(document.documentElement);

    return {
      datasets: [
        {
          label: 'Füllstand',
          data: visits.map((visit) => ({
            x: new Date(visit.eventTimestamp).getTime(),
            y: FILL_LEVEL_RANK[visit.fillLevel] ?? 0,
          })),
          borderColor: style.getPropertyValue('--color-red-500').trim(),
          backgroundColor: (context: ScriptableContext<'line'>) =>
            this.buildGradient(context, style),
          borderWidth: 3,
          tension: 0.35,
          fill: 'origin',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  });

  private buildGradient(
    context: ScriptableContext<'line'>,
    style: CSSStyleDeclaration,
  ): CanvasGradient | string {
    const chart = context.chart;
    const { ctx, chartArea } = chart;

    if (!chartArea) {
      return style.getPropertyValue('--color-red-300').trim();
    }

    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, style.getPropertyValue('--color-red-50'));
    gradient.addColorStop(0.7, style.getPropertyValue('--color-red-300'));
    gradient.addColorStop(1, style.getPropertyValue('--color-red-500'));
    return gradient;
  }
}
