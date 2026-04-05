import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GoogleMap, MapAdvancedMarker, MapInfoWindow } from '@angular/google-maps';
import { Button, ButtonDirective, ButtonLabel } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { BinMapMarkerVM, BinMapResponseDTO } from '../bin.model';
import { BinService } from '../bin.service';

@Component({
  selector: 'app-bin-map',
  imports: [
    GoogleMap,
    MapAdvancedMarker,
    MapInfoWindow,
    ButtonDirective,
    ButtonLabel,
    RouterLink,
    Button,
  ],
  templateUrl: './bin-map.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinMap {
  private readonly binService = inject(BinService);
  private readonly markerClass = 'pi text-white rounded-full p-1 rounded';

  readonly mueveMarker: {
    position: google.maps.LatLngLiteral;
    title: string;
    content: HTMLElement;
  } = {
    position: { lat: 47.120678, lng: 7.257629 },
    title: 'MÜVE Biel-Seeland AG',
    content: this.createBuildingIcon(),
  };

  readonly strasseninspektoratMarker: {
    position: google.maps.LatLngLiteral;
    title: string;
    content: HTMLElement;
  } = {
    position: { lat: 47.125467, lng: 7.259864 },
    title: 'Strasseninspektorat',
    content: this.createBuildingIcon(),
  };

  readonly bins = toSignal(this.binService.getBins(), { initialValue: [] });

  readonly binMapMarkers = computed<BinMapMarkerVM[]>(() =>
    this.bins().map((bin) => ({
      ...bin,
      position: { lat: bin.coordX4326, lng: bin.coordY4326 },
      content: this.createBinIcon(bin),
    })),
  );
  readonly selectedBin = signal<BinMapMarkerVM | null>(null);
  readonly infoWindow = viewChild.required(MapInfoWindow);

  createBinIcon(bin: BinMapResponseDTO): HTMLElement {
    const el = document.createElement('span');
    el.className = `${this.markerClass} pi-trash ${bin.isActive ? 'bg-red-500' : 'bg-gray-400'}`;
    return el;
  }

  createBuildingIcon(): HTMLElement {
    const el = document.createElement('span');
    el.className = `${this.markerClass} pi-building bg-black`;
    return el;
  }

  openInfoWindow(marker: MapAdvancedMarker, bin: BinMapMarkerVM): void {
    this.selectedBin.set(bin);
    this.infoWindow().open(marker);
  }

  closeInfoWindow(): void {
    this.infoWindow().close();
    this.selectedBin.set(null);
  }

  readonly center: google.maps.LatLngLiteral = { lat: 47.142471, lng: 7.259719 };

  readonly mapOptions: google.maps.MapOptions = {
    zoom: 15,
    minZoom: 14,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    streetViewControl: true,
    fullscreenControl: false,
    mapTypeControl: false,
    rotateControl: false,
    cameraControl: false,
    keyboardShortcuts: false,
    mapId: 'BIN_MAP_ID',
  };
}
