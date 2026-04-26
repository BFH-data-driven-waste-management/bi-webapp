import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BinDetailsResponseDTO,
  BinListResponseDTO,
  BinMapResponseDTO,
  BinVisitHistoryResponseDTO,
} from './bin.model';
import { PageDTO } from '../shared/models/common.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BinService {
  private readonly http = inject(HttpClient);
  private readonly binDetailsApiUrl = `${environment.apiBaseUrl}/bins/bindetails`;
  private readonly binMapApiUrl = `${environment.apiBaseUrl}/bins/binmap`;
  private readonly binListApiUrl = `${environment.apiBaseUrl}/bins/binlist`;

  getBins(): Observable<BinMapResponseDTO[]> {
    return this.http.get<BinMapResponseDTO[]>(this.binMapApiUrl);
  }

  getBinList(): Observable<BinListResponseDTO[]> {
    return this.http.get<BinListResponseDTO[]>(this.binListApiUrl);
  }

  getBinDetailsById(binId: number): Observable<BinDetailsResponseDTO> {
    return this.http.get<BinDetailsResponseDTO>(`${this.binDetailsApiUrl}/${binId}`);
  }

  getBinVisitsByBinId(
    binId: number,
    page = 0,
    size = 10,
  ): Observable<PageDTO<BinVisitHistoryResponseDTO>> {
    return this.http.get<PageDTO<BinVisitHistoryResponseDTO>>(
      `${this.binDetailsApiUrl}/${binId}/visits`,{
        params: {
          page,
          size
        }
      }
    );
  }

  exportBinVisitsCsvByBinId(binId: number): Observable<Blob> {
    return this.http.get(`${this.binDetailsApiUrl}/${binId}/visits/csv`, {
      responseType: 'blob',
    });
  }
}
