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
import { BinListResponseDTO, FullBinVM } from '../bin.model';
import { Button } from 'primeng/button';
import { TableColumn } from '../../shared/models/common.model';

type BinHeuristicId =
  | 'increase-bin-density-static'
  | 'reduce-approach-frequency-dynamic'
  | 'increase-approach-frequency-dynamic';

type BinHeuristicToggle = {
  id: BinHeuristicId;
  label: string;
  category: 'static' | 'dynamic';
  sorts: SortMeta[];
  filterChips: string[]; // TODO maybe there is a better generic solution
};

@Component({
  selector: 'app-bin-list',
  imports: [
    TableModule,
    RouterLink,
    Toolbar,
    FormsModule,
    ToggleButton,
    Chip,
    Button,
  ],
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

    switch (this.activeHeuristicId()) {
      case 'increase-bin-density-static':
        return bins.filter((bin) => this.isIncreaseDensityCandidate(bin));
      case 'reduce-approach-frequency-dynamic':
        return bins.filter((bin) => this.isReduceApproachCandidate(bin));
      case 'increase-approach-frequency-dynamic':
        return bins.filter((bin) => this.isIncreaseApproachCandidate(bin));
      default:
        return bins;
    }
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
      id: 'increase-bin-density-static',
      label: 'Behälterdichte erhöhen',
      category: 'static',
      filterChips: [
        'Aktiv = Ja',
        'Ø Besuche/Woche (90d) > 5',
        'Leer-/Halbvollquote (90d) < 50%',
        'Übervoll-Quote (90d) > 1%',
      ],
      sorts: [
        { field: 'overfullVisitRatio90d', order: -1 },
        { field: 'avgWeeklyVisits90d', order: -1 },
        { field: 'lowFillVisitRatio90d', order: 1 },
      ],
    },
    {
      id: 'reduce-approach-frequency-dynamic',
      label: 'Anfahrtsfrequenz reduzieren',
      category: 'dynamic',
      filterChips: [
        'Aktiv = Ja',
        'Ø Besuche/Woche (90d) > 4',
        'Leer-/Halbvollquote (90d) > 50%',
        'Übervoll-Quote (90d) < 1%',
      ],
      sorts: [
        { field: 'lowFillVisitRatio90d', order: -1 },
        { field: 'overfullVisitRatio90d', order: 1 },
        { field: 'avgWeeklyVisits90d', order: 1 },
      ],
    },
    {
      id: 'increase-approach-frequency-dynamic',
      label: 'Anfahrtsfrequenz erhöhen',
      category: 'dynamic',
      filterChips: [
        'Aktiv = Ja',
        'Ø Besuche/Woche (90d) < 4',
        'Leer-/Halbvollquote (90d) < 50%',
        'Übervoll-Quote (90d) > 1%',
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

    return activeHeuristic.filterChips;
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

  // TODO verify tresholds
  private isIncreaseDensityCandidate(bin: BinListResponseDTO): boolean {
    return (
      bin.avgWeeklyVisits90d > 5 &&
      bin.lowFillVisitRatio90d < 0.5 &&
      bin.overfullVisitRatio90d > 0.01 &&
      bin.isActive
    );
  }

  // TODO verify tresholds
  private isReduceApproachCandidate(bin: BinListResponseDTO): boolean {
    return (
      bin.avgWeeklyVisits90d > 4 &&
      bin.lowFillVisitRatio90d > 0.5 &&
      bin.overfullVisitRatio90d < 0.01 &&
      bin.isActive
    );
  }

  // TODO verify tresholds
  private isIncreaseApproachCandidate(bin: BinListResponseDTO): boolean {
    return (
      bin.avgWeeklyVisits90d < 4 &&
      bin.lowFillVisitRatio90d < 0.5 &&
      bin.overfullVisitRatio90d > 0.01 &&
      bin.isActive
    );
  }

  // TODO andere generelle "gates"?:
  // visits_90d >= x?
}
