import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from 'primeng/card';
import { Skeleton } from 'primeng/skeleton';
import { LOCALE } from '../../constants/constants';

@Component({
  selector: 'app-simple-metric-card',
  imports: [Card, Skeleton, DecimalPipe, PercentPipe],
  templateUrl: './simple-metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleMetricCard {
  readonly header = input.required<string>();
  readonly icon = input.required<string>();
  readonly value = input<number>();
  readonly percent = input(false);
  readonly loading = input(false);

  // used for access in template
  protected readonly LOCALE = LOCALE;
}
