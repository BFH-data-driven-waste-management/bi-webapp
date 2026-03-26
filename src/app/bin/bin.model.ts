import { BinVisitFullDTO } from '../tour/tour.model';

export interface BinDTO {
  coordX: number;
  coordY: number;
  type: string;
  isMapped: boolean;
}

export interface BinDetailsDTO extends BinDTO {
  visits: BinVisitFullDTO[];
}

export interface BinMapMarkerVM extends BinDTO {
  position: google.maps.LatLngLiteral;
  content: HTMLElement;
}
