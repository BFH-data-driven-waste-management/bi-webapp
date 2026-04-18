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
import { BinHeuristicFilter, BinHeuristicToggle, FullBinVM } from '../bin.model';
import { Button } from 'primeng/button';
import { TableColumn } from '../../shared/models/common.model';
import { BIN_HEURISTIC_TOGGLES, filterBinsByHeuristic } from './bin-heuristics';

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

  private readonly bins = toSignal(this.binService.getBinList(), { initialValue: [] });

  readonly filteredBins = computed(() => {
    const bins = this.bins();
    const activeHeuristic = this.activeHeuristic();
    if (!activeHeuristic) {
      return bins;
    }

    return filterBinsByHeuristic(bins, activeHeuristic.filters);
  });

  readonly binRows = computed<FullBinVM[]>(() =>
    this.filteredBins().map((bin) => ({
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

  readonly heuristicToggles: BinHeuristicToggle[] = BIN_HEURISTIC_TOGGLES;

  readonly activeHeuristic = signal<BinHeuristicToggle | null>(null);

  readonly activeHeuristicFilterChips = computed<string[]>(() => {
    const activeHeuristic = this.activeHeuristic();
    if (!activeHeuristic) {
      return [];
    }

    return activeHeuristic.filters.map((filter) => this.toFilterChipLabel(filter));
  });

  readonly exportFilename = computed<string>(() => {
    const activeHeuristicId = this.activeHeuristic()?.id;
    return !activeHeuristicId ? 'bin-list' : `bin-list-filtered-heuristic-${activeHeuristicId}`;
  });

  multiSortMeta: SortMeta[] | null = this.initialSortMeta.map((sort) => ({ ...sort }));

  get staticHeuristicToggles(): BinHeuristicToggle[] {
    return this.heuristicToggles.filter((toggle) => toggle.category === 'static');
  }

  get dynamicHeuristicToggles(): BinHeuristicToggle[] {
    return this.heuristicToggles.filter((toggle) => toggle.category === 'dynamic');
  }

  onHeuristicToggleChange(toggle: BinHeuristicToggle, isActive: boolean): void {
    if (!isActive) {
      this.activeHeuristic.set(null);
      this.multiSortMeta = this.initialSortMeta.map((sort) => ({ ...sort }));
      return;
    }

    this.activeHeuristic.set(toggle);
    this.multiSortMeta =
      toggle?.sorts.map((sort) => ({ ...sort })) ??
      this.initialSortMeta.map((sort) => ({ ...sort }));
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
