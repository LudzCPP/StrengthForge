import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/http/api-base-url.token';

interface OneRepMaxDto {
  readonly exercise: string;
  readonly oneRepMaxKg: number;
}

/**
 * Klient HTTP mockowanego mikroserwisu zawodnika (data-access).
 *
 * Potwierdzony 1RM to dana profilowa zawodnika, dlatego jej pobieranie żyje
 * w domenie `athlete-profile`, a nie w `strength-progression` – progresja jest
 * konsumentem profilu, nie jego właścicielem.
 */
@Injectable({ providedIn: 'root' })
export class AthleteApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** GET /api/strength/bench-press/1rm – potwierdzony rekord 1RM. */
  getConfirmedOneRepMax(): Observable<number> {
    return this.http
      .get<OneRepMaxDto>(`${this.baseUrl}/strength/bench-press/1rm`)
      .pipe(map((dto) => dto.oneRepMaxKg));
  }
}
