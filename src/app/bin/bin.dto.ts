export interface BinDTO {
  coordX: number;
  coordY: number;
  type: string;
  isMapped: boolean;
}

export interface BinMapMarker extends BinDTO {
  position: google.maps.LatLngLiteral;
}
