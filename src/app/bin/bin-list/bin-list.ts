import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { BinService } from '../bin.service';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';
import { ToggleButton } from 'primeng/togglebutton';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-bin-list',
  imports: [TableModule, DecimalPipe, RouterLink, Toolbar, FormsModule, ToggleButton],
  templateUrl: './bin-list.html',
  styleUrl: './bin-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinList {
  private readonly binService = inject(BinService);

  readonly bins = toSignal(this.binService.getBinList(), { initialValue: [] });
  readonly rows = 20;
}
