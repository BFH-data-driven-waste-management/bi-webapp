import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BinDetailsResponseDTO, BinListResponseDTO, BinMapResponseDTO } from './bin.model';
import { PageDTO } from '../shared/models/common.model';

@Injectable({
  providedIn: 'root',
})
export class BinService {
  private readonly http = inject(HttpClient);
  private readonly binDetailsApiUrl = 'http://localhost:8081/api/bins/bindetails'; // TODO better/scalable url definitions
  private readonly binMapApiUrl = 'http://localhost:8081/api/bins/binmap';
  private readonly binListApiUrl = 'http://localhost:8081/api/bins/binlist';

  getBins(): Observable<BinMapResponseDTO[]> {
    return this.http.get<BinMapResponseDTO[]>(this.binMapApiUrl);
  }

  getBinList(page = 0, size = 20): Observable<PageDTO<BinListResponseDTO>> {
    return this.http.get<PageDTO<BinListResponseDTO>>(this.binListApiUrl, {
      params: { page, size },
    });
  }

  getBinDetailsById(binId: number): Observable<BinDetailsResponseDTO> {
    return this.http.get<BinDetailsResponseDTO>(`${this.binDetailsApiUrl}/${binId}`);
  }
}
