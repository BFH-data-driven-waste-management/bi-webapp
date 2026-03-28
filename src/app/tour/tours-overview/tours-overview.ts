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
  Column,
  MapMarkerVm,
  PageDTO,
  TourDTO,
  TourPathVm,
  TourTimelineItem,
  TourVm,
} from '../tour.model';
import { Chip } from 'primeng/chip';
import { Toolbar } from 'primeng/toolbar';
import { lv95ToLatLng } from '../../shared/maps/coordinates';
import { DateTimeService } from '../../shared/services/date-time.service';
import { Router } from '@angular/router';
import { TourService } from '../tour.service';

@Component({
  selector: 'app-tours',
  imports: [TableModule, GoogleMap, MapAdvancedMarker, MapPolyline, Button, Chip, Toolbar],
  templateUrl: './tours-overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToursOverview implements OnInit, AfterViewInit {
  private readonly markerClass = 'pi text-white rounded-full p-1 rounded';
  private readonly muevePosition: google.maps.LatLngLiteral = { lat: 47.120678, lng: 7.257629 };

  readonly router = inject(Router);
  readonly tourService = inject(TourService);
  readonly dateTimeService = inject(DateTimeService);

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
          startedAtLabel: this.dateTimeService.format(tour.startedAt),
          endedAtLabel: this.dateTimeService.format(tour.endedAt),
        }) as TourVm,
    ),
  );

  protected selectedTours: TourDTO[] = [];
  private readonly selectedTourAcrossPagesMap = new Map<number, TourDTO>();

  protected canBeAligned = false;
  protected markers: MapMarkerVm[] = [];
  protected tourPaths: TourPathVm[] = [];
  protected showMueve = false;

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
    this.selectedTours = currentPageTours.filter((tour) =>
      this.selectedTourAcrossPagesMap.has(tour.id),
    );
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
      const sortedTimeline = this.getSortedTimelineItems(tour);
      const timelineForMap = this.showMueve
        ? sortedTimeline
        : sortedTimeline.filter((timelineItem) => timelineItem.type === 'binVisit');

      this.markers.push(...this.buildMarkersForTour(tour, timelineForMap));

      const path = timelineForMap.map((timelineItem) =>
        timelineItem.type === 'binVisit'
          ? lv95ToLatLng(timelineItem.bin.coordX, timelineItem.bin.coordY)
          : this.muevePosition,
      );

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

  protected toggleMueve(): void {
    this.showMueve = !this.showMueve;
    this.rebuildMapData();
    this.alignMap();
  }

  protected alignMap(): void {
    const map = this.mapCmp().googleMap;
    if (!map) return;

    const totalTimelineItems = this.selectedToursAcrossPages.reduce(
      (sum, tour) =>
        sum + tour.binVisits.length + (this.showMueve ? tour.vehicleEmptyings.length : 0),
      0,
    );

    if (totalTimelineItems === 0) {
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

    if (this.showMueve &&
      this.selectedToursAcrossPages.some((tour) => tour.vehicleEmptyings.length > 0)) {
      bounds.extend(this.muevePosition);
    }

    map.fitBounds(bounds, 20);
    this.canBeAligned = false;
  }

  /**
   * This returns all timeline items (bin visits, vehicle emptyings) sorted by timestamp ascending.
   */
  private getSortedTimelineItems(tour: TourDTO): TourTimelineItem[] {
    const timelineItems: TourTimelineItem[] = [
      ...tour.binVisits.map((binVisit) => ({
        ...binVisit,
        type: 'binVisit' as const,
      })),
      ...tour.vehicleEmptyings.map((vehicleEmptying) => ({
        ...vehicleEmptying,
        type: 'vehicleEmptying' as const,
      })),
    ];

    return timelineItems.sort(
      (a, b) =>
        Date.parse(this.getTimelineItemTimestamp(a)) - Date.parse(this.getTimelineItemTimestamp(b)),
    );
  }

  private buildMarkersForTour(tour: TourDTO, timelineItems: TourTimelineItem[]): MapMarkerVm[] {
    const totalBinVisits = timelineItems.filter(
      (timelineItem) => timelineItem.type === 'binVisit',
    ).length;
    let currentBinVisitIndex = 0;

    return timelineItems.map((timelineItem) => {
      if (timelineItem.type === 'vehicleEmptying') {
        return {
          id: `${tour.id}-vehicleEmptying-${timelineItem.id}`,
          position: this.muevePosition,
          title: `Müve - ${this.dateTimeService.format(timelineItem.emptyingTimestamp)}`,
          content: this.createVehicleEmptyingIcon(),
        };
      }

      const marker = {
        id: `${tour.id}-binVisit-${timelineItem.id}`,
        position: lv95ToLatLng(timelineItem.bin.coordX, timelineItem.bin.coordY),
        title: `${timelineItem.bin.type} - ${timelineItem.fillLevel} - ${timelineItem.visitAction}`,
        content: this.createBinIcon(
          currentBinVisitIndex,
          currentBinVisitIndex === totalBinVisits - 1,
        ),
      };

      currentBinVisitIndex += 1;
      return marker;
    });
  }

  private createBinIcon(index: number, last: boolean): HTMLElement {
    const el = document.createElement('span');
    el.className =
      'h-7 rounded-full bg-black text-white text-base font-bold flex items-center justify-center leading-none px-2 min-w-7';

    if (index === 0) {
      el.textContent = 'Start';
    } else if (last) {
      el.textContent = 'Ende';
    } else {
      el.textContent = String(index + 1);
    }

    return el;
  }

  private createVehicleEmptyingIcon(): HTMLElement {
    const el = document.createElement('span');
    el.className = `${this.markerClass} pi-building bg-black`;
    return el;
  }

  private getTimelineItemTimestamp(timelineItem: TourTimelineItem): string {
    return timelineItem.type === 'binVisit'
      ? timelineItem.eventTimestamp
      : timelineItem.emptyingTimestamp;
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
