import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-trend-metric-card',
  imports: [Card],
  templateUrl: './trend-metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendMetricCard {
  readonly header = input.required<string>();
  readonly value = input.required<string | number>();
  readonly secondaryValue = input.required<string | number>();
  readonly secondaryIcon = input.required<string>();
}
