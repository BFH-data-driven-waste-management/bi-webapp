import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-simple-metric-card',
  imports: [Card],
  templateUrl: './simple-metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleMetricCard {
  readonly header = input.required<string>();
  readonly icon = input.required<string>();
  readonly value = input.required<string | number>();
}
