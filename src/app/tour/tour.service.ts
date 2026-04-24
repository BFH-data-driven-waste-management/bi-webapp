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
  private readonly tourDetailsApiUrl = 'http://localhost:8080/api/tourdetails';
  private readonly tourOverviewApiUrl = 'http://localhost:8080/api/touroverview';

  getTourById(id: number): Observable<TourDTO> {
    return this.http.get<TourDTO>(this.tourDetailsApiUrl + `/${id}`);
  }

  getTours(page = 0, size = 4): Observable<PageDTO<TourOverviewDTO>> {
    return this.http.get<PageDTO<TourOverviewDTO>>(this.tourOverviewApiUrl, {
      params: {
        page,
        size,
      },
    });
  }

  exportToursCsv(): Observable<Blob> {
    return this.http.get(`${this.tourOverviewApiUrl}/csv`, {
      responseType: 'blob',
    });
  }
}
