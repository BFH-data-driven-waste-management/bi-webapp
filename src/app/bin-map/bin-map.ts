import { Component, computed, inject } from '@angular/core';
import { BinService } from '../bin/bin.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BinDTO, BinMapMarker } from '../bin/bin.dto';
import { lv95ToLatLng } from '../maps/coordinates.utils';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';

@Component({
  selector: 'app-bin-map',
  imports: [GoogleMap, MapAdvancedMarker],
  templateUrl: './bin-map.html'
})
export class BinMap {
  private readonly binService = inject(BinService);

  readonly bins = toSignal(this.binService.getBins(), { initialValue: [] as BinDTO[] });

  readonly mapMarkers = computed<BinMapMarker[]>(() =>
    this.bins().map((bin) => ({
      ...bin,
      position: lv95ToLatLng(bin.coordX, bin.coordY),
    })),
  );

  readonly center: google.maps.LatLngLiteral = { lat: 47.142471, lng: 7.259719 };

  readonly mapOptions: google.maps.MapOptions = {
    zoom: 15,
    minZoom: 14,
    colorScheme: google.maps.ColorScheme.DARK,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    rotateControl: false,
    cameraControl: false,
    keyboardShortcuts: false,
    mapId: 'BIN_MAP_ID',
  };
}
