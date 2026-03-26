import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from 'primeng/card';
import { BinDetailsDTO } from '../bin.model';

@Component({
  selector: 'app-bin-details',
  imports: [Card],
  templateUrl: './bin-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinDetails {
  bin = input.required<BinDetailsDTO>();
}
