import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { BinService } from '../bin.service';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';
import { ToggleButton } from 'primeng/togglebutton';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortMeta } from 'primeng/api';

type BinHeuristicId =
  | 'increase-bin-density-static'
  | 'reduce-approach-frequency-dynamic'
  | 'increase-approach-frequency-dynamic';

type BinHeuristicToggle = {
  id: BinHeuristicId;
  label: string;
  category: 'static' | 'dynamic';
  sorts: SortMeta[];
};

@Component({
  selector: 'app-bin-list',
  imports: [TableModule, DecimalPipe, RouterLink, Toolbar, FormsModule, ToggleButton, PercentPipe],
  templateUrl: './bin-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinList {
  private readonly binService = inject(BinService);
  private readonly initialSortMeta: SortMeta[] = [{ field: 'binId', order: 1 }];

  readonly bins = toSignal(this.binService.getBinList(), { initialValue: [] });
  readonly rows = 20;

  readonly heuristicToggles: BinHeuristicToggle[] = [
    {
      id: 'increase-bin-density-static',
      label: 'Behälterdichte erhöhen',
      category: 'static',
      sorts: [
        { field: 'avgWeeklyVisits90d', order: -1 },
        { field: 'overfullVisitRatio90d', order: -1 },
        { field: 'lowFillVisitRatio90d', order: 1 },
      ],
    },
    {
      id: 'reduce-approach-frequency-dynamic',
      label: 'Anfahrtsfrequenz reduzieren',
      category: 'dynamic',
      sorts: [
        { field: 'avgWeeklyVisits90d', order: -1 },
        { field: 'overfullVisitRatio90d', order: 1 },
        { field: 'lowFillVisitRatio90d', order: -1 },
      ],
    },
    {
      id: 'increase-approach-frequency-dynamic',
      label: 'Anfahrtsfrequenz erhöhen',
      category: 'dynamic',
      sorts: [
        { field: 'avgWeeklyVisits90d', order: 1 },
        { field: 'overfullVisitRatio90d', order: -1 },
        { field: 'lowFillVisitRatio90d', order: 1 },
      ],
    },
  ];

  activeHeuristicId: BinHeuristicId | null = null;
  multiSortMeta: SortMeta[] | null = this.initialSortMeta.map((sort) => ({ ...sort }));

  get staticHeuristicToggles(): BinHeuristicToggle[] {
    return this.heuristicToggles.filter((toggle) => toggle.category === 'static');
  }

  get dynamicHeuristicToggles(): BinHeuristicToggle[] {
    return this.heuristicToggles.filter((toggle) => toggle.category === 'dynamic');
  }

  onHeuristicToggleChange(toggleId: BinHeuristicId, isActive: boolean): void {
    if (!isActive) {
      this.activeHeuristicId = null;
      this.multiSortMeta = this.initialSortMeta.map((sort) => ({ ...sort }));
      return;
    }

    this.activeHeuristicId = toggleId;

    const selectedToggle = this.heuristicToggles.find((toggle) => toggle.id === toggleId);
    this.multiSortMeta =
      selectedToggle?.sorts.map((sort) => ({ ...sort })) ??
      this.initialSortMeta.map((sort) => ({ ...sort }));
  }
}
