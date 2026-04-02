import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from 'primeng/card';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-simple-metric-card',
  imports: [Card, Skeleton],
  templateUrl: './simple-metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleMetricCard {
  readonly header = input.required<string>();
  readonly icon = input.required<string>();
  readonly value = input<string | number>(); // TODO required?
  readonly loading = input(false);
}
