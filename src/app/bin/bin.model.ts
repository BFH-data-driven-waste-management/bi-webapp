import { FillLevel, KpiMetricResponseDTO, VisitAction } from '../shared/models/common.model';

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

export interface BinListResponseDTO {
  binId: number;
  type: string;
  isActive: boolean;
  avgWeeklyVisits90d: number;
  lowFillVisitRatio90d: number;
  overfullVisitRatio90d: number;
  coordX2056: number;
  coordY2056: number;
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

export interface BinVisitHistoryResponseDTO {
  binVisitId: number;
  binId: number;
  tourId: number;
  sequenceInTour: number;
  eventTimestamp: string;
  fillLevelCode: FillLevel;
  actionCode: VisitAction;
  licensePlate: string;
}

export interface BinDayFeaturesResponseDTO {
  baselineAvgVisitsPerWeek90d: KpiMetricResponseDTO | null;
  baselineAvgEmptyingsPerWeek90d: KpiMetricResponseDTO | null;
  lowFillVisitRatio90d: number | null;
  overfullVisitRatio90d: number | null;
  notEmptiedRatio90d: number | null;
  emptyingRank90d: number | null;
  goodWeatherSensitivityScore: number | null;
  badWeatherSensitivityScore: number | null;
  eventSensitivityScore: number | null;
}

export interface DailyCountResponseDTO {
  dateKey: number;
  count: number;
}

export interface FullBinVm extends BinListResponseDTO {
  isActiveLabel: string;
  coord2056Label: string;
  avgWeeklyVisits90dLabel: string;
  lowFillVisitRatio90dLabel: string;
  overfullVisitRatio90dLabel: string;
}

export interface BinVisitVm extends BinVisitHistoryResponseDTO {
  eventTimestampLabel: string;
  fillLevelLabel: string;
  fillLevelClass: string;
  visitActionLabel: string;
  visitActionSeverity: 'success' | 'contrast';
}
