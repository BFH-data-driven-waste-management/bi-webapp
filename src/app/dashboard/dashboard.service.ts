import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponseDTO } from './dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8081/api/dashboard';

  getDashboard(): Observable<DashboardResponseDTO> {
    return this.http.get<DashboardResponseDTO>(this.apiUrl);
  }
}
