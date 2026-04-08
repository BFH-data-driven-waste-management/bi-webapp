export interface KpiMetricResponseDTO {
  value: number;
  deltaRelative: number;
}

export interface PageDTO<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
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
