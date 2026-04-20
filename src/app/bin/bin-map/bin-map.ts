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
import { Toolbar } from 'primeng/toolbar';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BinMapMarkerVM, BinMapResponseDTO, BinMapView } from '../bin.model';
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
    Toolbar,
    SelectButton,
    FormsModule,
  ],
  templateUrl: './bin-map.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinMap {
  private readonly binService = inject(BinService);
  private readonly markerClass = 'pi text-white rounded-full p-1 rounded';

  readonly mapViewOptions: { label: string; value: BinMapView }[] = [
    { label: 'Standard', value: 'default' },
    { label: 'Heatmap: Müllaufkommen', value: 'waste-generation' },
    { label: 'Heatmap: Letzter Besuch', value: 'last-visit-age' },
  ];

  readonly activeMapView = signal<BinMapView>('default');

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

  readonly binMapMarkers = computed<BinMapMarkerVM[]>(() => {
    const activeMapView = this.activeMapView();

    return this.bins().map((bin) => {
      const heatValue = activeMapView === 'default' ? 0 : this.getHeatmapValue(bin, activeMapView);

      return {
        ...bin,
        position: { lat: bin.coordX4326, lng: bin.coordY4326 },
        content: this.createBinIcon(bin, activeMapView),
        zIndex: this.toBinMarkerZIndex(heatValue, activeMapView),
      };
    });
  });
  readonly selectedBin = signal<BinMapMarkerVM | null>(null);
  readonly infoWindow = viewChild.required(MapInfoWindow);

  readonly center: google.maps.LatLngLiteral = { lat: 47.142471, lng: 7.259719 };

  readonly mapOptions = computed<google.maps.MapOptions>(() => ({
    zoom: 15,
    minZoom: this.activeMapView() === 'default' ? 14 : 13,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    streetViewControl: true,
    fullscreenControl: false,
    mapTypeControl: false,
    rotateControl: false,
    cameraControl: false,
    keyboardShortcuts: false,
    mapId: 'BIN_MAP_ID',
  }));

  onMapViewChange(nextView: BinMapView | null): void {
    this.activeMapView.set(nextView ?? 'default');
  }

  createBinIcon(bin: BinMapResponseDTO, activeMapView: BinMapView): HTMLElement {
    const el = document.createElement('span');
    const isHeatmapView = activeMapView !== 'default';

    if (isHeatmapView) {
      const value = this.getHeatmapValue(bin, activeMapView);
      const { red, green, blue, opacity } = this.toHeatmapColor(value);
      const dotOpacity = Math.max(0.7, opacity * 0.9);

      el.className = 'block rounded-full';
      el.style.width = '2rem';
      el.style.height = '2rem';
      el.style.background = `radial-gradient(
      circle,
      rgba(${red}, ${green}, ${blue}, ${dotOpacity}) 40%,
      rgba(${red}, ${green}, ${blue}, ${opacity * 0.3}) 70%,
      rgba(${red}, ${green}, ${blue}, 0) 100%)`;
      el.style.boxShadow = `0 0 1px rgba(${red}, ${green}, ${blue}, ${opacity * 0.15})`;
    } else {
      el.className = `${this.markerClass} pi-trash ${bin.isActive ? 'bg-red-500' : 'bg-gray-400'}`;
    }
    this.applyMarkerTransition(el);
    return el;
  }

  private applyMarkerTransition(markerElement: HTMLElement): void {
    markerElement.style.transition = 'transform 180ms ease-out, opacity 180ms ease-out';
    markerElement.style.transform = 'scale(0.9)';
    markerElement.style.opacity = '0.75';

    requestAnimationFrame(() => {
      markerElement.style.transform = 'scale(1)';
      markerElement.style.opacity = '1';
    });
  }

  private toBinMarkerZIndex(heatValue: number, activeMapView: BinMapView): number {
    if (activeMapView === 'default') {
      return 1;
    }

    return Math.round(heatValue * 100); // TODO multiply by 100 after dividing by 100 previously is ugly
  }

  private getHeatmapValue(
    bin: BinMapResponseDTO,
    activeMapView: Exclude<BinMapView, 'default'>,
  ): number {
    const rawValue =
      activeMapView === 'waste-generation'
        ? bin.wasteGenerationHeat / 100
        : bin.lastEmptyingHeat / 100;

    return Math.min(1, Math.max(0, rawValue));
  }

  /** Maps a (normalised) heatmap value to a color computed between predefined color stops (interpolation) and to matching opacity */
  private toHeatmapColor(value: number): {
    red: number;
    green: number;
    blue: number;
    opacity: number;
  } {
    const colorStops: Array<{ stop: number; color: [number, number, number] }> = [
      { stop: 0, color: [34, 197, 94] }, // green
      { stop: 0.33, color: [250, 204, 21] }, // yellow
      { stop: 0.66, color: [249, 115, 22] }, // orange
      { stop: 1, color: [239, 68, 68] }, // red
    ];

    const lowerStop =
      [...colorStops].reverse().find((colorStop) => value >= colorStop.stop) ?? colorStops[0];
    const upperStop =
      colorStops.find((colorStop) => value <= colorStop.stop) ?? colorStops[colorStops.length - 1];

    if (lowerStop.stop === upperStop.stop) {
      return {
        red: lowerStop.color[0],
        green: lowerStop.color[1],
        blue: lowerStop.color[2],
        opacity: 0.45 + value * 0.55,
      };
    }

    const range = upperStop.stop - lowerStop.stop;
    const ratio = (value - lowerStop.stop) / range;
    const red = Math.round(lowerStop.color[0] + (upperStop.color[0] - lowerStop.color[0]) * ratio);
    const green = Math.round(lowerStop.color[1] + (upperStop.color[1] - lowerStop.color[1]) * ratio);
    const blue = Math.round(lowerStop.color[2] + (upperStop.color[2] - lowerStop.color[2]) * ratio);
    const opacity = 0.45 + value * 0.55;
    return { red, green, blue, opacity };
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
}
