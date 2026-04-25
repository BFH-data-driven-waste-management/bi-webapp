import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { BinDetailsResponseDTO, BinVisitHistoryResponseDTO, BinVisitVM } from '../bin.model';
import { ChartData, ChartOptions, ScriptableContext } from 'chart.js';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { SimpleMetricCard } from '../../shared/components/simple-metric-card/simple-metric-card';
import { TrendMetricCard } from '../../shared/components/trend-metric-card/trend-metric-card';
import { Button } from 'primeng/button';
import { Location } from '@angular/common';
import { Skeleton } from 'primeng/skeleton';
import { BinService } from '../bin.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { buildDailyFrequencyOptions, buildFillTrendOptions } from './chart-options';
import { distinctUntilChanged, EMPTY, finalize, map, switchMap } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { PageDTO } from '../../shared/models/common.model';
import { DateTimeService } from '../../shared/services/date-time.service';
import {
  BIN_VISIT_ACTION_LABELS,
  BIN_VISIT_ACTION_TAG_SEVERITIES,
  BIN_VISIT_FILL_LEVEL_LABELS,
  BIN_VISIT_FILL_LEVEL_TAG_CLASSES,
} from '../../tour/tour.presentation';
import { BIEL_CENTER_COORDS } from '../../shared/constants/constants';
import { DetailsPageHeader } from '../../shared/components/details-page-header/details-page-header';

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
    TableModule,
    Tag,
    Toolbar,
    RouterLink,
    DetailsPageHeader,
  ],
  templateUrl: './bin-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinDetails implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly location = inject(Location);
  private readonly binService = inject(BinService);
  private readonly route = inject(ActivatedRoute);
  private readonly dateTimeService = inject(DateTimeService);

  readonly loading = signal(true);
  readonly binVisitLoading = signal(false);
  readonly exportLoading = signal(false);
  readonly binVisitPage = signal<PageDTO<BinVisitHistoryResponseDTO>>({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  readonly binVisitRows = 10;
  readonly binVisitFirst = signal(0);
  readonly bin = signal<BinDetailsResponseDTO | null>(null);
  readonly binPosition = computed(() => {
    const bin = this.bin();
    if (!bin) {
      return BIEL_CENTER_COORDS;
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
    const trend = [...(bin.fillTrend12m ?? [])].sort((a, b) => a.dateKey - b.dateKey); // TODO is sorting needed?

    return {
      labels: trend.map((entry) => this.formatDateKey(entry.dateKey)),
      datasets: [
        {
          label: 'Fülltrend (12 Monate)',
          data: trend.map((entry) => Number(entry.count)),
          borderColor: style.getPropertyValue('--color-red-500').trim(),
          backgroundColor: (context: ScriptableContext<'line'>) =>
            this.buildSeriesGradient(context, style, {
              low: '--color-red-50',
              mid: '--color-red-300',
              high: '--color-red-500',
            }),
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
    };
  });

  readonly dailyFrequencyOptions: ChartOptions<'line'> = buildDailyFrequencyOptions();

  readonly visitFrequencyData = computed<ChartData<'line'>>(() => {
    const bin = this.bin();
    if (!bin) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const style = getComputedStyle(document.documentElement);
    const trend = [...(bin.visitFrequency90d ?? [])].sort((a, b) => a.dateKey - b.dateKey);

    return {
      labels: trend.map((entry) => this.formatDateKey(entry.dateKey)),
      datasets: [
        {
          data: trend.map((entry) => Number(entry.count)),
          borderColor: style.getPropertyValue('--color-blue-500').trim(),
          backgroundColor: (context: ScriptableContext<'line'>) =>
            this.buildSeriesGradient(context, style, {
              low: '--color-blue-50',
              mid: '--color-blue-300',
              high: '--color-blue-500',
            }),
          fill: true,
          tension: 0.35,
          pointRadius: 1,
          pointHoverRadius: 4,
        },
      ],
    };
  });

  readonly emptyingFrequencyData = computed<ChartData<'line'>>(() => {
    const bin = this.bin();
    if (!bin) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const style = getComputedStyle(document.documentElement);
    const trend = [...(bin.emptyingFrequency90d ?? [])].sort((a, b) => a.dateKey - b.dateKey);

    return {
      labels: trend.map((entry) => this.formatDateKey(entry.dateKey)),
      datasets: [
        {
          data: trend.map((entry) => Number(entry.count)),
          borderColor: style.getPropertyValue('--color-emerald-500').trim(),
          backgroundColor: (context: ScriptableContext<'line'>) =>
            this.buildSeriesGradient(context, style, {
              low: '--color-emerald-50',
              mid: '--color-emerald-300',
              high: '--color-emerald-500',
            }),
          fill: true,
          tension: 0.35,
          pointRadius: 1,
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
  readonly binVisits = computed<BinVisitVM[]>(() =>
    this.binVisitPage().content.map((visit) => ({
      ...visit,
      eventTimestampLabel: this.dateTimeService.format(visit.eventTimestamp),
      fillLevelLabel: BIN_VISIT_FILL_LEVEL_LABELS[visit.fillLevelCode],
      fillLevelClass: BIN_VISIT_FILL_LEVEL_TAG_CLASSES[visit.fillLevelCode],
      visitActionLabel: BIN_VISIT_ACTION_LABELS[visit.actionCode],
      visitActionSeverity: BIN_VISIT_ACTION_TAG_SEVERITIES[visit.actionCode],
    })),
  );

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        distinctUntilChanged(),
        switchMap((binId) => {
          if (!Number.isFinite(binId)) {
            this.loading.set(false);
            this.bin.set(null);
            this.resetBinVisits();
            return EMPTY;
          }

          this.loading.set(true); // TODO might not be needed
          this.binVisitFirst.set(0);
          this.loadBinVisits(binId, 0, this.binVisitRows);
          return this.binService.getBinDetailsById(binId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (binDetailsResponse) => {
          this.bin.set(binDetailsResponse);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onBinVisitLazyLoad(event: TableLazyLoadEvent): void {
    const binId = this.bin()?.binId;
    if (binId == null) {
      return;
    }

    const rows = event.rows ?? this.binVisitRows;
    const first = event.first ?? 0;
    const page = Math.floor(first / rows);

    this.binVisitFirst.set(first);
    this.loadBinVisits(binId, page, rows);
  }

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

  // TODO maybe outsource (also other gradients elsewhere)
  private buildSeriesGradient(
    context: ScriptableContext<'line'>,
    style: CSSStyleDeclaration,
    colors: { low: string; mid: string; high: string },
  ): CanvasGradient | string {
    const chart = context.chart;
    const { ctx, chartArea } = chart;

    if (!chartArea) {
      return style.getPropertyValue(colors.mid).trim();
    }

    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, style.getPropertyValue(colors.low));
    gradient.addColorStop(0.7, style.getPropertyValue(colors.mid));
    gradient.addColorStop(1, style.getPropertyValue(colors.high));
    return gradient;
  }

  goBack(): void {
    this.location.back();
  }

  exportBinVisitsCsv(): void {
    const binId = this.bin()?.binId;
    if (binId == null) {
      return;
    }

    this.exportLoading.set(true);
    this.binService
      .exportBinVisitsCsvByBinId(binId)
      .pipe(
        finalize(() => this.exportLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (csvBlob) => {
          const url = URL.createObjectURL(csvBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `bin-${binId}-visits.csv`;
          link.click();
          URL.revokeObjectURL(url);
        },
        error: () => {},
      });
  }

  private loadBinVisits(binId: number, page: number, size: number): void {
    this.binVisitLoading.set(true);
    this.binService
      .getBinVisitsByBinId(binId, page, size)
      .pipe(
        finalize(() => this.binVisitLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.binVisitPage.set(response),
        error: () => this.resetBinVisits(),
      });
  }

  private resetBinVisits(): void {
    this.binVisitPage.set({
      content: [],
      page: 0,
      size: this.binVisitRows,
      totalElements: 0,
      totalPages: 0,
    });
    this.binVisitFirst.set(0);
  }
}
