import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Card } from 'primeng/card';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-trend-metric-card',
  imports: [Card, Skeleton],
  templateUrl: './trend-metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendMetricCard {
  readonly header = input.required<string>();
  readonly value = input<string | number>();
  readonly trendValue = input<number>();
  readonly loading = input(false);

  readonly trendIcon = computed(() => {
    const trendValue = this.trendValue();
    if (trendValue == null || trendValue === 0) {
      return 'minus';
    }

    return trendValue > 0 ? 'arrow-up-right' : 'arrow-down-right';
  });

  readonly formattedTrendValue = computed(() => {
    const trendValue = this.trendValue();
    if (trendValue == null) {
      return '';
    }

    if (trendValue === 0) {
      return '0%';
    }

    const sign = trendValue > 0 ? '+' : '';

    return `${sign}${trendValue}%`;
  });
}
