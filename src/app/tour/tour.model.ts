import { BinDTO } from '../bin/bin.model';

export interface TourDTO {
  id: number;
  vehicleId: number;
  licensePlate: string; // TODO this name is semantically wrong
  startedAt: string;
  endedAt: string | null;
  binVisits: BinVisitFullDTO[];
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
