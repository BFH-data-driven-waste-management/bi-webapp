import { KpiMetricResponseDTO } from '../shared/models/kpi-metric.model';

export interface DashboardResponseDTO {
  installedBins: InstalledBinsResponseDTO;
  visits7d: KpiMetricResponseDTO;
  emptyings7d: KpiMetricResponseDTO;
  emptyingRate7d: KpiMetricResponseDTO;
  lowFillVisitShare90d: KpiMetricResponseDTO;
  lowFillEmptyingShare90d: KpiMetricResponseDTO;
  overfullEvents30d: KpiMetricResponseDTO;
}

export interface InstalledBinsResponseDTO {
  total: number;
  countOfBinType: CountOfBinTypeResponseDTO[];
}

export interface CountOfBinTypeResponseDTO {
  type: string;
  count: number;
}

