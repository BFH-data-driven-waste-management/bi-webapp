import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Card } from 'primeng/card';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-trend-metric-card',
  imports: [Card, Skeleton],
  providers: [DecimalPipe, PercentPipe],
  templateUrl: './trend-metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendMetricCard {
  private readonly decimalPipe = inject(DecimalPipe);
  private readonly percentPipe = inject(PercentPipe);

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
      return this.percentPipe.transform(value, '1.0-0', 'de-CH') ?? '';
    }

    return this.decimalPipe.transform(value, '1.0-2', 'de-CH') ?? '';
  });

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

    const formatted = this.percentPipe.transform(trendValue, '1.0-2', 'de-CH') ?? '';
    return trendValue > 0 ? `+${formatted}` : formatted;
  });
}
