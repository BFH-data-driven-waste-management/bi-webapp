export interface BinDTO {
  coordX: number;
  coordY: number;
  type: string;
  isMapped: boolean;
}

export interface BinMapMarkerVM extends BinDTO {
  position: google.maps.LatLngLiteral;
  content: HTMLElement;
}
