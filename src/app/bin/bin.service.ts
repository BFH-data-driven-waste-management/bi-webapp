import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BinDetailsDTO, BinDTO } from './bin.model';

@Injectable({
  providedIn: 'root',
})
export class BinService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/bins';

  getBins(): Observable<BinDTO[]> {
    return this.http.get<BinDTO[]>(this.apiUrl);
  }

  getBinDetailsByCoords(coordX: number, coordY: number): Observable<BinDetailsDTO> {
    return this.http.get<BinDetailsDTO>(this.apiUrl + `/${coordX}/${coordY}/details`);
  }
}
