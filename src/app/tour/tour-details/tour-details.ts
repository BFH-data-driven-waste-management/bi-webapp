import { Component, input } from '@angular/core';
import { TourDTO } from '../tour.model';

@Component({
  selector: 'app-tour-details',
  imports: [],
  templateUrl: './tour-details.html',
  styleUrl: './tour-details.css',
})
export class TourDetails {
  tour = input.required<TourDTO>();
}
