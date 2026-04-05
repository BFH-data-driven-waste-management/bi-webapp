import { KpiMetricResponseDTO } from '../shared/models/kpi-metric.model';

export interface BinMapResponseDTO {
  binId: number;
  type: string;
  isActive: boolean;
  coordX4326: number;
  coordY4326: number;
  coordX2056: number;
  coordY2056: number;
}

export interface BinMapMarkerVM extends BinMapResponseDTO {
  position: google.maps.LatLngLiteral;
  content: HTMLElement;
}

export interface BinDetailsResponseDTO {
  binId: number;
  binType: string;
  volumeLiters: number | null;
  active: boolean;
  coordX2056: number;
  coordY2056: number;
  coordX4326: number;
  coordY4326: number;
  lastVisitDateKey: number | null;
  lastEmptyingDateKey: number | null;
  binDayFeaturesResponse: BinDayFeaturesResponseDTO | null;
  visitFrequency90d: DailyCountResponseDTO[];
  emptyingFrequency90d: DailyCountResponseDTO[];
  fillTrend12m: DailyCountResponseDTO[];
}

export interface BinDayFeaturesResponseDTO {
  baselineAvgVisitsPerWeek90d: KpiMetricResponseDTO | null;
  baselineAvgEmptyingsPerWeek90d: KpiMetricResponseDTO | null;
  lowFillVisitRatio90d: number | null;
  notEmptiedRatio90d: number | null;
  emptyingRank90d: number | null;
  weatherSensitivityScore: number | null;
  rainSensitivityScore: number | null;
  sunSensitivityScore: number | null;
  heatSensitivityScore: number | null;
  eventSensitivityScore: number | null;
}

export interface DailyCountResponseDTO {
  dateKey: number;
  count: number;
}
