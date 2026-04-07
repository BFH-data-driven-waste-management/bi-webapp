import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { BinService } from '../bin.service';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';
import { ToggleButton } from 'primeng/togglebutton';
import { Chip } from 'primeng/chip';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortMeta } from 'primeng/api';
import { BinListResponseDTO } from '../bin.model';

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
    DecimalPipe,
    RouterLink,
    Toolbar,
    FormsModule,
    ToggleButton,
    PercentPipe,
    Chip,
  ],
  templateUrl: './bin-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinList {
  private readonly binService = inject(BinService);
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

  readonly rows = 20;

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
