import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BinDTO } from './bin.model';

@Injectable({
  providedIn: 'root',
})
export class BinService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/bins';

  getBins(): Observable<BinDTO[]> {
    return this.http.get<BinDTO[]>(this.apiUrl);
  }

  getBinByCoords(coordX: number, coordY: number): Observable<BinDTO> {
    return this.http.get<BinDTO>(this.apiUrl + `/${coordX}/${coordY}`);
  }
}
