import { AfterViewInit, Component, computed, input, OnInit, viewChild } from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapPolyline } from '@angular/google-maps';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { BinVisitFullDTO, MapMarkerVm, TourDTO, TourPathVm } from './tour.model';
import { Chip } from 'primeng/chip';
import { ChDateTimePipe } from '../shared/pipes/ch-date-time.pipe';
import { lv95ToLatLng } from '../shared/maps/coordinates';

@Component({
  selector: 'app-tours',
  imports: [TableModule, GoogleMap, MapAdvancedMarker, MapPolyline, Button, ChDateTimePipe, Chip],
  templateUrl: './tours.html',
})
export class Tours implements OnInit, AfterViewInit {
  readonly mapCmp = viewChild.required(GoogleMap);
  readonly tours = input.required<TourDTO[]>();
  readonly sortedTours = computed(() =>
    [...this.tours()].sort((a, b) => this.getEndedAtTimestamp(b) - this.getEndedAtTimestamp(a)),
  );
  readonly latestTour = computed(() => this.sortedTours()[0] ?? null);

  protected selectedTours: TourDTO[] = [];
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
    const latestTour = this.latestTour();

    if (!latestTour || latestTour.binVisits.length === 0) {
      return;
    }

    this.selectedTours = [latestTour];
    this.rebuildMapData();
  }

  ngAfterViewInit(): void {
    if (this.selectedTours.length > 0) {
      this.alignMap();
    }
  }

  private getEndedAtTimestamp(tour: TourDTO): number {
    return tour.endedAt ? Date.parse(tour.endedAt) : 0;
  }

  protected onSelectionChange(): void {
    this.rebuildMapData();
    this.alignMap();
  }

  private rebuildMapData(): void {
    this.markers = [];
    this.tourPaths = [];

    this.selectedTours.forEach((tour, index) => {
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

    const totalBinVisits = this.selectedTours.reduce((sum, tour) => sum + tour.binVisits.length, 0);

    if (totalBinVisits === 0) {
      map.setCenter(this.center);
      map.setZoom(this.mapOptions.zoom ?? 14);
      this.canBeAligned = false;
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    for (const tour of this.selectedTours) {
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
      'h-7 rounded-lg bg-gray-700 text-white text-base font-bold flex items-center justify-center leading-none px-2 min-w-7';

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
}
