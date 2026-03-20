import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TourDTO } from './tour.model';
import { TourService } from './tour.service';

export const toursResolver: ResolveFn<TourDTO[]> = (route, state) => {
  const tourService = inject(TourService);

  return tourService.getTours();
};
