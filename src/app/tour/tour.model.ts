import { BinDTO } from '../bin/bin.model';

export interface TourDTO {
  id: number;
  vehicleId: number;
  licensePlate: string; // TODO this name is semantically wrong
  startedAt: string;
  endedAt: string | null;
  binVisits: BinVisitFullDTO[];
  vehicleEmptyings: VehicleEmptyingDTO[];
}

export interface BinVisitFullDTO {
  id: number;
  tourId: number;
  clientEventId: string;
  bin: BinDTO;
  eventTimestamp: string;
  fillLevel: FillLevel;
  visitAction: VisitAction;
}

export interface VehicleEmptyingDTO {
  id: number;
  tourId: number;
  emptyingTimestamp: string;
}

export interface TourTimelineItemVm {
  action: string;
  timestamp: string;
}

export enum FillLevel {
  OVERFULL = 'OVERFULL',
  FULL = 'FULL',
  HALF_FULL = 'HALF_FULL',
  EMPTY_OR_ALMOST_EMPTY = 'EMPTY_OR_ALMOST_EMPTY',
}

export enum VisitAction {
  EMPTIED = 'EMPTIED',
  NOT_EMPTIED = 'NOT_EMPTIED',
}

/**
 * Tour view model extending the dto with derived fields
 */
export interface TourVm extends TourDTO {
  binVisitsAmount: number;
  startedAtLabel: string;
  endedAtLabel: string;
}

export type MapMarkerVm = {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
  content: HTMLElement;
};

export type TourPathVm = {
  tourId: number;
  path: google.maps.LatLngLiteral[];
  options: google.maps.PolylineOptions;
};

export interface Column {
  // TODO maybe move to shared
  field: string;
  header: string;
}
