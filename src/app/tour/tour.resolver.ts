import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TourDTO } from './tour.model';
import { TourService } from './tour.service';

export const toursResolver: ResolveFn<TourDTO[]> = () => {
  const tourService = inject(TourService);
  return tourService.getTours();
};

export const tourResolver: ResolveFn<TourDTO> = (route) => {
  const tourService = inject(TourService);
  const id = Number(route.paramMap.get('id'));
  return tourService.getTourById(id);
};
