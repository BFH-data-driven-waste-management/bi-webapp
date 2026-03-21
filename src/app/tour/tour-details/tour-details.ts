import { Component, computed, input } from '@angular/core';
import { TourDTO } from '../tour.model';
import { Card } from 'primeng/card';
import { ChDateTimePipe } from '../../shared/pipes/ch-date-time.pipe';

@Component({
  selector: 'app-tour-details',
  imports: [Card, ChDateTimePipe],
  templateUrl: './tour-details.html',
  styleUrl: './tour-details.css',
})
export class TourDetails {
  tour = input.required<TourDTO>();

  emptyingsCount = computed(
    () => this.tour().binVisits.filter((visit) => visit.visitAction === 'EMPTIED').length,
  );
}
