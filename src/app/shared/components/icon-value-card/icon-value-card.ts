import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-icon-value-card',
  imports: [Card],
  templateUrl: './icon-value-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconValueCard {
  readonly header = input.required<string>();
  readonly iconClass = input<string>();
  readonly value = input.required<string | number>();
  readonly secondaryValue = input<string | number>();
  readonly secondaryIconClass = input<string>();
}
