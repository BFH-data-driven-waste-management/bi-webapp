import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { BinDetailsDTO } from '../bin.model';
import { BIN_VISIT_FILL_LEVEL_LABELS } from '../../tour/tour.presentation';
import { FillLevel } from '../../tour/tour.model';
import { ChartData, ChartOptions, ScriptableContext } from 'chart.js';
import { buildFillLevelOptions } from './chart-options';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { lv95ToLatLng } from '../../shared/maps/coordinates';
import { DateTimeService } from '../../shared/services/date-time.service';
import { IconValueCard } from '../../shared/components/icon-value-card/icon-value-card';
import { Button } from 'primeng/button';
import { Location } from '@angular/common';
import { Skeleton } from 'primeng/skeleton';

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
  imports: [Card, UIChart, GoogleMap, MapAdvancedMarker, IconValueCard, Button, Skeleton],
  templateUrl: './bin-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinDetails {
  private readonly location = inject(Location);
  readonly dateTimeService = inject(DateTimeService);
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
    formatDate: (timestamp) => this.dateTimeService.format(timestamp, 'date'),
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
          data: visits
            .map((visit) => ({
              x: new Date(visit.eventTimestamp).getTime(),
              y: FILL_LEVEL_RANK[visit.fillLevel] ?? 0,
            }))
            .slice(-30), // TODO slicing might be a temp solution
          borderColor: style.getPropertyValue('--color-red-500').trim(),
          backgroundColor: (context: ScriptableContext<'line'>) =>
            this.buildGradient(context, style),
          borderWidth: 3,
          tension: 0, // TODO whole interpolation stuff
          fill: 'origin',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  });

  /**
   * This is a convenience feature with relatively small overhead.
   * We load other Google Maps stuff logically in the frontend, so fetching the location here (for each bin's details invocation) is consistent and acceptable.
   * An alternative would be to fetch the location for each bin on bin master data import, which is immutable for the rest of the day.
   * This, however, would include fetching data for bins that are never queried on that day.
   * TODO caching (bin coordinates are immutable until next bin master data import, i.e. for one day) and document: fetching location here on demand and cache for a day is fine
   *
   * @see https://angular.dev/guide/signals/resource
   */

  readonly locationResource = resource({
    params: () => {
      const position = this.binPosition();
      return {
        lat: position.lat,
        lng: position.lng,
        fallback: `${this.bin().coordX} / ${this.bin().coordY}`,
      };
    },
    loader: async ({ params }) => {
      if (typeof google === 'undefined' || !google.maps?.Geocoder) {
        return params.fallback;
      }

      try {
        const geocoder = new google.maps.Geocoder();
        const { results } = await geocoder.geocode({
          location: { lat: params.lat, lng: params.lng },
        });

        const first = results[0];
        if (!first) {
          return params.fallback;
        }

        const route =
          first.address_components.find((component) => component.types.includes('route'))
            ?.long_name ?? '';

        const streetNumber =
          first.address_components.find((component) => component.types.includes('street_number'))
            ?.long_name ?? '';

        return route
          ? `${route}${streetNumber ? ` ${streetNumber}` : ''}`
          : first.formatted_address;
      } catch {
        return params.fallback;
      }
    },
  });

  readonly locationLabel = computed(() => this.locationResource.value() ?? '');
  readonly locationLoading = computed(() => this.locationResource.isLoading());

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

  goBack(): void {
    this.location.back();
  }
}
