import { formatNumber, formatPercent } from '@angular/common';
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
  readonly value = input<number>();
  readonly percent = input(false);
  readonly trendValue = input<number>();
  readonly loading = input(false);

  readonly formattedValue = computed(() => {
    const value = this.value();
    if (value == null) {
      return '';
    }

    if (this.percent()) {
      return formatPercent(value, 'de-CH', '1.0-0');
    }

    return formatNumber(value, 'de-CH', '1.0-0');
  });

  readonly trendIcon = computed(() => {
    const trendValue = this.trendValue();
    if (trendValue == null || trendValue === 0) {
      return 'arrow-right';
    }

    return trendValue > 0 ? 'arrow-up-right' : 'arrow-down-right';
  });

  readonly formattedTrendValue = computed(() => {
    const trendValue = this.trendValue();
    if (trendValue == null) {
      return '';
    }

    const formatted = formatPercent(trendValue, 'de-CH', '1.0-2');
    return trendValue > 0 ? `+${formatted}` : formatted;
  });
}
