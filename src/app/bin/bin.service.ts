import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BinDetailsDTO, BinDTO, BinMapResponseDTO } from './bin.model';

@Injectable({
  providedIn: 'root',
})
export class BinService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/bins';
  private readonly binMapApiUrl = 'http://localhost:8081/api/bins/binmap';

  getBins(): Observable<BinMapResponseDTO[]> {
    return this.http.get<BinMapResponseDTO[]>(this.binMapApiUrl);
  }

  getBinDetailsByCoords(coordX: number, coordY: number): Observable<BinDetailsDTO> {
    return this.http.get<BinDetailsDTO>(this.apiUrl + `/${coordX}/${coordY}/details`);
  }
}
