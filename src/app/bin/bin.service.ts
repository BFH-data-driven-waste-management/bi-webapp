import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BinDTO } from './bin.dto';
import { HttpClient } from '@angular/common/http';

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
