import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TourDTO, TourOverviewDTO } from './tour.model';
import { PageDTO } from '../shared/models/common.model';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8081/api/tours';

  getTours(page = 0, size = 4): Observable<PageDTO<TourOverviewDTO>> {
    return this.http.get<PageDTO<TourOverviewDTO>>(this.apiUrl, {
      params: {
        page,
        size,
      },
    });
  }

  getTourById(id: number): Observable<TourDTO> {
    return this.http.get<TourDTO>(this.apiUrl + `/${id}`);
  }
}
