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
