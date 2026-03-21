import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TourDTO } from './tour.model';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/tours';

  getTours(): Observable<TourDTO[]> {
    return this.http.get<TourDTO[]>(this.apiUrl);
  }

  getTourById(id: number): Observable<TourDTO> {
    return this.http.get<TourDTO>(this.apiUrl + `/${id}`);
  }
}
