import { Component, input } from '@angular/core';
import { Card } from 'primeng/card';
import { BinDTO } from '../bin/bin.dto';

@Component({
  selector: 'app-bin-details',
  imports: [Card],
  templateUrl: './bin-details.html'
})
export class BinDetails {
  bin = input.required<BinDTO>();
}
