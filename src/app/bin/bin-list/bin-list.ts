import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { BinService } from '../bin.service';
import { formatNumber, formatPercent } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';
import { ToggleButton } from 'primeng/togglebutton';
import { Chip } from 'primeng/chip';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortMeta } from 'primeng/api';
import {
  BinHeuristicFilter,
  BinHeuristicId,
  BinHeuristicToggle,
  BinListResponseDTO,
  FullBinVM,
} from '../bin.model';
import { Button } from 'primeng/button';
import { TableColumn } from '../../shared/models/common.model';

@Component({
  selector: 'app-bin-list',
  imports: [TableModule, RouterLink, Toolbar, FormsModule, ToggleButton, Chip, Button],
  templateUrl: './bin-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinList {
  private readonly binService = inject(BinService);
  private readonly locale = inject(LOCALE_ID);
  private readonly initialSortMeta: SortMeta[] = [{ field: 'binId', order: 1 }];

  private readonly binsRaw = toSignal(this.binService.getBinList(), { initialValue: [] });

  readonly bins = computed(() => {
    const bins = this.binsRaw();
    const activeHeuristic = this.heuristicToggles.find((toggle) => toggle.id === this.activeHeuristicId());
    if (!activeHeuristic) {
      return bins;
    }

    return bins.filter((bin) => activeHeuristic.filters
      .every((filter) => this.matchesFilter(bin, filter)));
  });

  readonly binRows = computed<FullBinVM[]>(() =>
    this.bins().map((bin) => ({
      ...bin,
      isActiveLabel: bin.isActive ? 'Ja' : 'Nein',
      coord2056Label: `${bin.coordX2056} / ${bin.coordY2056}`,
      avgWeeklyVisits90dLabel: formatNumber(bin.avgWeeklyVisits90d, this.locale, '1.0-2'),
      lowFillVisitRatio90dLabel: formatPercent(bin.lowFillVisitRatio90d, this.locale, '1.0-1'),
      overfullVisitRatio90dLabel: formatPercent(bin.overfullVisitRatio90d, this.locale, '1.0-1'),
    })),
  );

  readonly rows = 20;
  readonly columns: TableColumn[] = [
    { field: 'binId', header: 'Behälter-ID' },
    { field: 'type', header: 'Typ' },
    { field: 'isActiveLabel', header: 'Aktiv' },
    { field: 'coord2056Label', header: 'Koordinaten 2056' },
    { field: 'avgWeeklyVisits90dLabel', header: 'Ø Besuche/Woche (90d)' },
    { field: 'lowFillVisitRatio90dLabel', header: 'Leer-/Halbvollquote (90d)' },
    { field: 'overfullVisitRatio90dLabel', header: 'Übervoll-Quote (90d)' },
  ];

  readonly heuristicToggles: BinHeuristicToggle[] = [
    {
      id: 'increase-bin-density',
      label: 'Behälterdichte erhöhen',
      category: 'static',
      filters: [
        { label: 'Aktiv', field: 'isActive', operator: 'eq', value: true },
        { label: 'Ø Besuche/Woche (90d)', field: 'avgWeeklyVisits90d', operator: 'gt', value: 5 },
        {
          label: 'Leer-/Halbvollquote (90d)',
          field: 'lowFillVisitRatio90d',
          operator: 'lt',
          value: 0.5,
          displayAs: 'percent',
        },
        {
          label: 'Übervoll-Quote (90d)',
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
          label: 'Leer-/Halbvollquote (90d)',
          field: 'lowFillVisitRatio90d',
          operator: 'gt',
          value: 0.5,
          displayAs: 'percent',
        },
        {
          label: 'Übervoll-Quote (90d)',
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
          label: 'Leer-/Halbvollquote (90d)',
          field: 'lowFillVisitRatio90d',
          operator: 'lt',
          value: 0.5,
          displayAs: 'percent',
        },
        {
          label: 'Übervoll-Quote (90d)',
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

  readonly activeHeuristicId = signal<BinHeuristicId | null>(null);

  readonly activeHeuristicFilterChips = computed<string[]>(() => {
    const activeHeuristic = this.heuristicToggles.find(
      (toggle) => toggle.id === this.activeHeuristicId(),
    );
    if (!activeHeuristic) {
      return [];
    }

    return activeHeuristic.filters.map((filter) => this.toFilterChipLabel(filter));
  });

  readonly exportFilename = computed<string>(() => {
    const activeHeuristicId = this.activeHeuristicId();
    return !activeHeuristicId ? 'bin-list' : `bin-list-filtered-heuristic-${activeHeuristicId}`;
  });

  multiSortMeta: SortMeta[] | null = this.initialSortMeta.map((sort) => ({ ...sort }));

  get staticHeuristicToggles(): BinHeuristicToggle[] {
    return this.heuristicToggles.filter((toggle) => toggle.category === 'static');
  }

  get dynamicHeuristicToggles(): BinHeuristicToggle[] {
    return this.heuristicToggles.filter((toggle) => toggle.category === 'dynamic');
  }

  onHeuristicToggleChange(toggleId: BinHeuristicId, isActive: boolean): void {
    if (!isActive) {
      this.activeHeuristicId.set(null);
      this.multiSortMeta = this.initialSortMeta.map((sort) => ({ ...sort }));
      return;
    }

    this.activeHeuristicId.set(toggleId);

    const selectedToggle = this.heuristicToggles.find((toggle) => toggle.id === toggleId);
    this.multiSortMeta =
      selectedToggle?.sorts.map((sort) => ({ ...sort })) ??
      this.initialSortMeta.map((sort) => ({ ...sort }));
  }

  private matchesFilter(bin: BinListResponseDTO, filter: BinHeuristicFilter): boolean {
    const fieldValue = bin[filter.field];
    return this.compare(fieldValue, filter.operator, filter.value);
  }

  private compare(
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

  private toFilterChipLabel(filter: BinHeuristicFilter): string {
    const operatorLabel = this.toOperatorLabel(filter.operator);
    if (typeof filter.value === 'boolean') {
      const booleanLabel = filter.value ? 'Ja' : 'Nein';
      return `${filter.label} ${operatorLabel} ${booleanLabel}`;
    }

    const formattedValue =
      filter.displayAs === 'percent'
        ? formatPercent(filter.value, this.locale, '1.0-0')
        : formatNumber(filter.value, this.locale, '1.0-2');
    return `${filter.label} ${operatorLabel} ${formattedValue}`;
  }

  private toOperatorLabel(operator: BinHeuristicFilter['operator']): string {
    switch (operator) {
      case 'eq':
        return '=';
      case 'gt':
        return '>';
      case 'gte':
        return '≥';
      case 'lt':
        return '<';
      case 'lte':
        return '≤';
      default:
        return operator;
    }
  }
}
