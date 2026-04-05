export interface TourDTO {
  id: number;
  licensePlate: string;
  visitCount: number | null; // TODO why nulls?
  emptiedVisitCount: number | null;
  notEmptiedVisitCount: number | null;
  lowFillVisitCount: number | null;
  highFillVisitCount: number | null;
  overfullVisitCount: number | null;
  vehicleEmptyingCount: number | null;
  startedAt: string;
  endedAt: string | null;
  binVisits: BinVisitDTO[];
  vehicleEmptyings: VehicleEmptyingDTO[];
}

export interface TourOverviewDTO {
  id: number;
  licensePlate: string;
  vehicleEmptyingCount: number | null;
  startedAt: string;
  endedAt: string | null;
  vehicleEmptyings: VehicleEmptyingDTO[];
  binVisits: BinVisitDTO[];
}

export interface BinVisitDTO {
  id: number;
  binId: number;
  sequenceInTour: number;
  eventTimestamp: string;
  fillLevel: FillLevel;
  visitAction: VisitAction;
  binCoordX: number;
  binCoordY: number;
  binType: string;
}

export interface VehicleEmptyingDTO {
  id: number;
  sequenceInTour: number;
  eventTimestamp: string;
}

export type TourTimelineItem =
  | (BinVisitDTO & { type: 'binVisit' })
  | (VehicleEmptyingDTO & { type: 'vehicleEmptying' });

export interface SimpleTourTimelineItemVm {
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

export interface BinVisitVm extends BinVisitDTO {
  eventTimestampLabel: string;
  fillLevelLabel: string;
  fillLevelClass: string;
  visitActionLabel: string;
  visitActionSeverity: 'success' | 'contrast';
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
