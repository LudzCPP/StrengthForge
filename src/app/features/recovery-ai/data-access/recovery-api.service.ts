import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/http/api-base-url.token';
import { WeeklyVolume } from '../models/recovery.model';

/**
 * Klient HTTP mockowanego mikroserwisu regeneracji (data-access).
 * Zwraca surową historię objętości – logikę oceny robi dopiero fasada.
 */
@Injectable({ providedIn: 'root' })
export class RecoveryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** GET /api/recovery/volume-history – tonaż z ostatnich tygodni. */
  getVolumeHistory(): Observable<WeeklyVolume[]> {
    return this.http.get<WeeklyVolume[]>(`${this.baseUrl}/recovery/volume-history`);
  }
}
