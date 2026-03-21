import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapInfoWindow } from '@angular/google-maps';
import { Button, ButtonDirective, ButtonLabel } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { BinService } from '../bin.service';
import { BinDTO, BinMapMarkerVM } from '../bin.model';
import { lv95ToLatLng } from '../../shared/maps/coordinates';

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
})
export class BinMap {
  private readonly binService = inject(BinService);

  readonly bins = input.required<BinDTO[]>();

  readonly binMapMarkers = computed<BinMapMarkerVM[]>(() =>
    this.bins().map((bin) => ({
      ...bin,
      position: lv95ToLatLng(bin.coordX, bin.coordY),
      content: this.createBinIcon(),
    })),
  );
  readonly selectedBin = signal<BinMapMarkerVM | null>(null);
  readonly infoWindow = viewChild.required(MapInfoWindow);

  createBinIcon(): HTMLElement {
    const el = document.createElement('span');
    el.className = 'pi pi-trash text-white rounded bg-red-400 p-[3px] rounded';
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
