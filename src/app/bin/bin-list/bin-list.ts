import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { BinListResponseDTO } from '../bin.model';
import { BinService } from '../bin.service';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bin-list',
  imports: [TableModule, DecimalPipe, RouterLink],
  templateUrl: './bin-list.html',
  styleUrl: './bin-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinList implements OnInit {
  private readonly binService = inject(BinService);

  readonly bins = signal<BinListResponseDTO[]>([]);
  readonly totalRecords = signal(0);
  readonly rows = 20;

  ngOnInit(): void {
    this.loadPage(0, this.rows);
  }

  protected onPageChange(event: TableLazyLoadEvent): void {
    const pageSize = event.rows ?? this.rows;
    const page = event.first ? Math.floor(event.first / pageSize) : 0;
    this.loadPage(page, pageSize);
  }

  private loadPage(page: number, pageSize: number): void {
    this.binService.getBinList(page, pageSize).subscribe((response) => {
      this.bins.set(response.content);
      this.totalRecords.set(response.totalElements);
    });
  }
}
