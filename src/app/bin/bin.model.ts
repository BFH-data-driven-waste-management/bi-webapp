import { BinVisitFullDTO } from '../tour/tour.model';

export interface BinDTO {
  coordX: number;
  coordY: number;
  type: string;
  isMapped: boolean;
}

export interface BinMapResponseDTO {
  binId: number;
  type: string;
  isActive: boolean;
  coordX4326: number;
  coordY4326: number;
  coordX2056: number;
  coordY2056: number;
}

export interface BinDetailsDTO extends BinDTO {
  visits: BinVisitFullDTO[];
}

export interface BinMapMarkerVM extends BinMapResponseDTO {
  position: google.maps.LatLngLiteral;
  content: HTMLElement;
}
