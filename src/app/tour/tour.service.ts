import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TourDTO, TourOverviewDTO } from './tour.model';
import { PageDTO } from '../shared/models/common.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private readonly http = inject(HttpClient);
  private readonly tourDetailsApiUrl = `${environment.apiBaseUrl}/tours/tourdetails`;
  private readonly tourOverviewApiUrl = `${environment.apiBaseUrl}/tours/touroverview`;

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
