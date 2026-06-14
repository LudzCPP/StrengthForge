import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/http/api-base-url.token';

interface OneRepMaxDto {
  readonly exercise: string;
  readonly oneRepMaxKg: number;
}

/**
 * Cienki klient HTTP mockowanego mikroserwisu siłowego (data-access).
 *
 * Odpowiada wyłącznie za komunikację i mapowanie DTO → typ domenowy.
 * Zwraca `Observable` (RxJS), bo to natywny kontrakt strumieni HTTP w Angularze;
 * dopiero fasada zamienia go na Signal dla warstwy widoku.
 */
@Injectable({ providedIn: 'root' })
export class ProgressionApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** GET /api/strength/bench-press/1rm – potwierdzony rekord 1RM zawodnika. */
  getConfirmedOneRepMax(): Observable<number> {
    return this.http
      .get<OneRepMaxDto>(`${this.baseUrl}/strength/bench-press/1rm`)
      .pipe(map((dto) => dto.oneRepMaxKg));
  }
}
