import { Component, input } from '@angular/core';
import { TourDTO } from './tour.model';

@Component({
  selector: 'app-tours',
  imports: [],
  templateUrl: './tours.html',
  styleUrl: './tours.css',
})
export class Tours {
  tours = input.required<TourDTO[]>();
}
