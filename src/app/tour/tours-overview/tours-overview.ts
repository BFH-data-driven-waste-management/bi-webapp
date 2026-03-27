import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapPolyline } from '@angular/google-maps';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import {
  BinVisitFullDTO,
  Column,
  MapMarkerVm,
  PageDTO,
  TourDTO,
  TourPathVm,
  TourVm,
} from '../tour.model';
import { Chip } from 'primeng/chip';
import { Toolbar } from 'primeng/toolbar';
import { ChDateTimeService } from '../../shared/pipes/ch-date-time.service';
import { lv95ToLatLng } from '../../shared/maps/coordinates';
import { Router } from '@angular/router';
import { TourService } from '../tour.service';

@Component({
  selector: 'app-tours',
  imports: [TableModule, GoogleMap, MapAdvancedMarker, MapPolyline, Button, Chip, Toolbar],
  templateUrl: './tours-overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToursOverview implements OnInit, AfterViewInit {
  readonly router = inject(Router);
  readonly chDateTimeService = inject(ChDateTimeService);
  readonly tourService = inject(TourService);

  readonly columns: Column[] = [
    { field: 'id', header: 'ID' },
    { field: 'licensePlate', header: 'Fahrzeugnummer' },
    { field: 'startedAtLabel', header: 'Startzeit' },
    { field: 'endedAtLabel', header: 'Endzeit' },
    { field: 'binVisitsAmount', header: 'Anzahl Behälterbesuche' },
  ];

  readonly mapCmp = viewChild.required(GoogleMap);

  readonly firstPage = input.required<PageDTO<TourDTO>>();
  readonly tours = signal<TourDTO[]>([]);
  readonly totalRecords = signal(0);
  readonly rows = signal(4);
  readonly latestTourIdFromFirstPage = signal<number | null>(null);
  readonly tableRows = computed<TourVm[]>(() =>
    [...this.tours()].map(
      (tour) =>
        ({
          ...tour,
          binVisitsAmount: tour.binVisits.length,
          startedAtLabel: this.chDateTimeService.format(tour.startedAt),
          endedAtLabel: this.chDateTimeService.format(tour.endedAt),
        }) as TourVm,
    ),
  );

  protected selectedTours: TourDTO[] = [];
  private readonly selectedTourAcrossPagesMap = new Map<number, TourDTO>();

  protected canBeAligned = false;
  protected markers: MapMarkerVm[] = [];
  protected tourPaths: TourPathVm[] = [];

  protected readonly center: google.maps.LatLngLiteral = {
    lat: 47.142471,
    lng: 7.259719,
  };

  protected readonly mapOptions: google.maps.MapOptions = {
    zoom: 14,
    minZoom: 13,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    streetViewControl: true,
    fullscreenControl: false,
    mapTypeControl: false,
    rotateControl: false,
    cameraControl: false,
    keyboardShortcuts: false,
    mapId: 'TOURS_MAP_ID',
  };

  private readonly tourColors = [
    '#ef4444',
    '#3b82f6',
    '#a855f7',
    '#22c55e',
    '#f59e0b',
    '#06b6d4',
    '#ec4899',
    '#84cc16',
    '#f97316',
    '#6366f1',
  ];

  ngOnInit(): void {
    const initialPage = this.firstPage();
    this.tours.set(initialPage.content);
    this.totalRecords.set(initialPage.totalElements);
    this.rows.set(initialPage.size);
    this.latestTourIdFromFirstPage.set(initialPage.content[0]?.id ?? null);
    this.setCrossPageSelection(this.getDefaultSelection(initialPage.content, initialPage.number));
    this.syncCurrentPageSelection(initialPage.content);
    this.rebuildMapData();
  }

  ngAfterViewInit(): void {
    if (this.selectedToursAcrossPages.length > 0) {
      this.alignMap();
    }
  }

  protected get selectedToursAcrossPages(): TourDTO[] {
    return [...this.selectedTourAcrossPagesMap.values()];
  }

  protected onSelectionChange(): void {
    this.updateCrossPageSelectionFromCurrentPage();
    this.rebuildMapData();
    this.alignMap();
  }

  protected onPageChange(event: TableLazyLoadEvent): void {
    const pageSize = event.rows ?? this.rows();
    const page = event.first ? Math.floor(event.first / pageSize) : 0;

    this.tourService.getTours(page, pageSize).subscribe((pageResult) => {
      this.tours.set(pageResult.content);
      this.totalRecords.set(pageResult.totalElements);
      this.rows.set(pageResult.size);
      if (this.selectedTourAcrossPagesMap.size === 0) {
        this.setCrossPageSelection(this.getDefaultSelection(pageResult.content, pageResult.number));
      }
      this.syncCurrentPageSelection(pageResult.content);
      this.rebuildMapData();
      this.alignMap();
    });
  }

  private getDefaultSelection(tours: TourDTO[], pageNumber: number): TourDTO[] {
    if (pageNumber !== 0) {
      return [];
    }

    const latestTour = tours[0];
    if (!latestTour || latestTour.binVisits.length === 0) {
      return [];
    }

    return [latestTour];
  }

  private updateCrossPageSelectionFromCurrentPage(): void {
    const currentPageIds = new Set(this.tours().map((tour) => tour.id));

    for (const id of currentPageIds) {
      this.selectedTourAcrossPagesMap.delete(id);
    }
    for (const selectedTour of this.selectedTours) {
      this.selectedTourAcrossPagesMap.set(selectedTour.id, selectedTour);
    }
  }

  private syncCurrentPageSelection(currentPageTours: TourDTO[]): void {
    this.selectedTours = currentPageTours.filter((tour) => this.selectedTourAcrossPagesMap.has(tour.id));
  }

  private setCrossPageSelection(tours: TourDTO[]): void {
    this.selectedTourAcrossPagesMap.clear();
    for (const tour of tours) {
      this.selectedTourAcrossPagesMap.set(tour.id, tour);
    }
  }

  private rebuildMapData(): void {
    this.markers = [];
    this.tourPaths = [];

    this.selectedToursAcrossPages.forEach((tour, index) => {
      const sortedVisits = this.getSortedVisits(tour);

      this.markers.push(...this.buildMarkersForTour(tour, sortedVisits));

      const path = sortedVisits.map((visit) => lv95ToLatLng(visit.bin.coordX, visit.bin.coordY));

      if (path.length > 1) {
        this.tourPaths.push({
          tourId: tour.id,
          path,
          options: {
            geodesic: true,
            strokeColor: this.tourColors[index % this.tourColors.length],
            strokeOpacity: 0.8,
            strokeWeight: 3.5,
          },
        });
      }
    });
  }

  protected alignMap(): void {
    const map = this.mapCmp().googleMap;
    if (!map) return;

    const totalBinVisits = this.selectedToursAcrossPages.reduce(
      (sum, tour) => sum + tour.binVisits.length,
      0,
    );

    if (totalBinVisits === 0) {
      map.setCenter(this.center);
      map.setZoom(this.mapOptions.zoom ?? 14);
      this.canBeAligned = false;
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    for (const tour of this.selectedToursAcrossPages) {
      for (const visit of tour.binVisits) {
        bounds.extend(lv95ToLatLng(visit.bin.coordX, visit.bin.coordY));
      }
    }

    map.fitBounds(bounds, 20);
    this.canBeAligned = false;
  }

  /**
   * This returns a sorted copy of the binsVisits array (in ES2023, there would be a corresponding "toSorted")
   */
  private getSortedVisits(tour: TourDTO): BinVisitFullDTO[] {
    return [...tour.binVisits].sort(
      (a, b) => Date.parse(a.eventTimestamp) - Date.parse(b.eventTimestamp),
    );
  }

  private buildMarkersForTour(tour: TourDTO, visits: BinVisitFullDTO[]): MapMarkerVm[] {
    return visits.map((visit, index) => ({
      id: `${tour.id} - ${visit.id}`,
      position: lv95ToLatLng(visit.bin.coordX, visit.bin.coordY),
      title: `${visit.bin.type} - ${visit.fillLevel} - ${visit.visitAction}`,
      content: this.createBinIcon(index, index === visits.length - 1),
    }));
  }

  private createBinIcon(index: number, last: boolean): HTMLElement {
    const el = document.createElement('span');
    el.className =
      'h-7 rounded-full bg-gray-700 text-white text-base font-bold flex items-center justify-center leading-none px-2 min-w-7';

    if (index === 0) {
      el.textContent = 'Start';
    } else if (last) {
      el.textContent = 'Ende';
    } else {
      el.textContent = String(index + 1);
    }

    return el;
  }

  rowClass(binVisitAmount: number) {
    return { 'bg-gray-100': binVisitAmount === 0 };
  }

  protected showTourDetails() {
    this.router.navigate(['/tour', this.selectedToursAcrossPages[0].id]).then((_) => {});
  }

  protected deselectAll() {
    this.selectedTours = [];
    this.selectedTourAcrossPagesMap.clear();
    this.onSelectionChange();
  }
}
