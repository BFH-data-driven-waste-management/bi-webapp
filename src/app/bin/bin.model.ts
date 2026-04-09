import { FillLevel, KpiMetricResponseDTO, VisitAction } from '../shared/models/common.model';
import { SortMeta } from 'primeng/api';

// ================= data transfer objects =================

export interface BinMapResponseDTO {
  binId: number;
  type: string;
  isActive: boolean;
  coordX4326: number;
  coordY4326: number;
  coordX2056: number;
  coordY2056: number;
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
  visitFrequency90d: DailyCountResponseDTO[]; // TODO verify that daily is ok
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

// ================= view models =================

export interface BinMapMarkerVM extends BinMapResponseDTO {
  position: google.maps.LatLngLiteral;
  content: HTMLElement;
}

export interface FullBinVM extends BinListResponseDTO {
  isActiveLabel: string;
  coord2056Label: string;
  avgWeeklyVisits90dLabel: string;
  lowFillVisitRatio90dLabel: string;
  overfullVisitRatio90dLabel: string;
}

export interface BinVisitVM extends BinVisitHistoryResponseDTO {
  eventTimestampLabel: string;
  fillLevelLabel: string;
  fillLevelClass: string;
  visitActionLabel: string;
  visitActionSeverity: 'success' | 'contrast';
}

// ================= other =================

export type BinHeuristicId =
  | 'increase-bin-density'
  | 'reduce-approach-frequency'
  | 'increase-approach-frequency';

export type NumericBinHeuristicField =
  | 'isActive'
  | 'avgWeeklyVisits90d'
  | 'lowFillVisitRatio90d'
  | 'overfullVisitRatio90d';

export type FilterOperator = 'eq' | 'gt' | 'gte' | 'lt' | 'lte';

export interface BinHeuristicToggle {
  id: BinHeuristicId;
  label: string;
  category: 'static' | 'dynamic';
  sorts: SortMeta[];
  filters: BinHeuristicFilter[];
}

export interface BinHeuristicFilter {
  label: string;
  field: NumericBinHeuristicField;
  operator: FilterOperator;
  value: number | boolean;
  displayAs?: 'number' | 'percent';
}
