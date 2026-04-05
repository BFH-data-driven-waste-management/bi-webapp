import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { BinDetailsResponseDTO } from '../bin.model';
import { ChartData, ChartOptions, ScriptableContext } from 'chart.js';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { SimpleMetricCard } from '../../shared/components/simple-metric-card/simple-metric-card';
import { TrendMetricCard } from '../../shared/components/trend-metric-card/trend-metric-card';
import { Button } from 'primeng/button';
import { Location } from '@angular/common';
import { Skeleton } from 'primeng/skeleton';
import { BinService } from '../bin.service';
import { ActivatedRoute } from '@angular/router';
import { buildFillTrendOptions } from './chart-options';

@Component({
  selector: 'app-bin-details',
  imports: [
    Card,
    UIChart,
    GoogleMap,
    MapAdvancedMarker,
    SimpleMetricCard,
    TrendMetricCard,
    Button,
    Skeleton,
  ],
  templateUrl: './bin-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinDetails implements OnInit {
  private readonly location = inject(Location);
  private readonly binService = inject(BinService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly bin = signal<BinDetailsResponseDTO | null>(null);
  readonly binPosition = computed(() => {
    const bin = this.bin();
    if (!bin) {
      return { lat: 47.142471, lng: 7.259719 }; // TODO this is the center, maybe put to constants file
    }
    return { lat: bin.coordX4326, lng: bin.coordY4326 };
  });

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

  readonly fillLevelOptions: ChartOptions<'line'> = buildFillTrendOptions({
    toFillLevelLabel: (value) => this.toFillLevelLabel(value),
  });

  readonly fillLevelData = computed<ChartData<'line'>>(() => {
    const bin = this.bin();
    if (!bin) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const style = getComputedStyle(document.documentElement);
    const trend = [...(bin.fillTrend12m ?? [])]
      .sort((a, b) => a.dateKey - b.dateKey); // TODO is sorting needed?

    return {
      labels: trend.map((entry) => this.formatDateKey(entry.dateKey)),
      datasets: [
        {
          label: 'Fülltrend (12 Monate)',
          data: trend.map((entry) => Number(entry.count)),
          borderColor: style.getPropertyValue('--color-red-500').trim(),
          backgroundColor: (context: ScriptableContext<'line'>) =>
            this.buildGradient(context, style),
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 4,
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
      const bin = this.bin();
      const position = this.binPosition();
      return {
        lat: position.lat,
        lng: position.lng,
        fallback: bin ? `${bin.coordX2056} / ${bin.coordY2056}` : '',
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

  // TODO this is a bit of a hack... verify
  private toFillLevelLabel(fillLevelScore: number): string {
    if (fillLevelScore <= 0.25) {
      return 'Leer oder fast leer';
    }
    if (fillLevelScore <= 0.5) {
      return 'Halbvoll';
    }
    if (fillLevelScore <= 0.75) {
      return 'Voll';
    }
    return 'Übervoll';
  }

  // TODO centralize if reused?
  private formatDateKey(dateKey: number): string {
    const value = String(dateKey);
    if (value.length !== 8) {
      return value;
    }
    const year = dateKey.toString().slice(0, 4);
    const month = dateKey.toString().slice(4, 6);
    const day = dateKey.toString().slice(6, 8);
    return `${day}.${month}.${year}`;
  }

  ngOnInit(): void {
    const binId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(binId)) {
      this.loading.set(false);
      return;
    }

    this.binService.getBinDetailsById(binId).subscribe({
      next: (binDetailsResponse) => {
        this.bin.set(binDetailsResponse);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

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
