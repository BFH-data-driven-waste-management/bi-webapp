import {
  BinHeuristicFilter,
  BinHeuristicToggle,
  BinListResponseDTO,
} from '../bin.model';

export const BIN_HEURISTIC_TOGGLES: BinHeuristicToggle[] = [
  {
    id: 'increase-bin-density',
    label: 'Behälterdichte erhöhen',
    category: 'static',
    filters: [
      { label: 'Aktiv', field: 'isActive', operator: 'eq', value: true },
      { label: 'Ø Besuche/Woche (90d)', field: 'avgWeeklyVisits90d', operator: 'gt', value: 5 },
      {
        label: 'Anteil Besuche mit niedrigem Füllstand (90d)',
        field: 'lowFillVisitRatio90d',
        operator: 'lt',
        value: 0.5,
        displayAs: 'percent',
      },
      {
        label: 'Anteil Besuche mit übervollem Füllstand (90d)',
        field: 'overfullVisitRatio90d',
        operator: 'gt',
        value: 0.01,
        displayAs: 'percent',
      },
    ],
    sorts: [
      { field: 'overfullVisitRatio90d', order: -1 },
      { field: 'avgWeeklyVisits90d', order: -1 },
      { field: 'lowFillVisitRatio90d', order: 1 },
    ],
  },
  {
    id: 'reduce-approach-frequency',
    label: 'Anfahrtsfrequenz reduzieren',
    category: 'dynamic',
    filters: [
      { label: 'Aktiv', field: 'isActive', operator: 'eq', value: true },
      { label: 'Ø Besuche/Woche (90d)', field: 'avgWeeklyVisits90d', operator: 'gt', value: 4 },
      {
        label: 'Anteil Besuche mit niedrigem Füllstand (90d)',
        field: 'lowFillVisitRatio90d',
        operator: 'gt',
        value: 0.5,
        displayAs: 'percent',
      },
      {
        label: 'Anteil Besuche mit übervollem Füllstand (90d)',
        field: 'overfullVisitRatio90d',
        operator: 'lt',
        value: 0.01,
        displayAs: 'percent',
      },
    ],
    sorts: [
      { field: 'lowFillVisitRatio90d', order: -1 },
      { field: 'overfullVisitRatio90d', order: 1 },
      { field: 'avgWeeklyVisits90d', order: 1 },
    ],
  },
  {
    id: 'increase-approach-frequency',
    label: 'Anfahrtsfrequenz erhöhen',
    category: 'dynamic',
    filters: [
      { label: 'Aktiv', field: 'isActive', operator: 'eq', value: true },
      { label: 'Ø Besuche/Woche (90d)', field: 'avgWeeklyVisits90d', operator: 'lt', value: 4 },
      {
        label: 'Anteil Besuche mit niedrigem Füllstand (90d)',
        field: 'lowFillVisitRatio90d',
        operator: 'lt',
        value: 0.5,
        displayAs: 'percent',
      },
      {
        label: 'Anteil Besuche mit übervollem Füllstand (90d)',
        field: 'overfullVisitRatio90d',
        operator: 'gt',
        value: 0.01,
        displayAs: 'percent',
      },
    ],
    sorts: [
      { field: 'overfullVisitRatio90d', order: -1 },
      { field: 'avgWeeklyVisits90d', order: 1 },
      { field: 'lowFillVisitRatio90d', order: 1 },
    ],
  },
];

export function filterBinsByHeuristic(
  bins: BinListResponseDTO[],
  filters: BinHeuristicFilter[],
): BinListResponseDTO[] {
  return bins.filter((bin) => filters.every((filter) => matchesFilter(bin, filter)));
}

function matchesFilter(bin: BinListResponseDTO, filter: BinHeuristicFilter): boolean {
  const fieldValue = bin[filter.field];
  return compare(fieldValue, filter.operator, filter.value);
}

function compare(
  left: number | boolean,
  operator: BinHeuristicFilter['operator'],
  right: number | boolean,
): boolean {
  switch (operator) {
    case 'eq':
      return left === right;
    case 'gt':
      return Number(left) > Number(right);
    case 'gte':
      return Number(left) >= Number(right);
    case 'lt':
      return Number(left) < Number(right);
    case 'lte':
      return Number(left) <= Number(right);
    default:
      return false;
  }
}
