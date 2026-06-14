import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { assessRecovery, RecoveryAssessment, WeeklyVolume } from '../models/recovery.model';
import { RecoveryApiService } from './recovery-api.service';

/**
 * Fasada / store asystenta regeneracji.
 *
 * Identyczny wzorzec jak w domenie progresji: Observable z mikroserwisu →
 * `toSignal`, a ocena to czyste `computed()`. Komponent dostaje gotowy werdykt
 * i nie wie nic o ACWR ani o HTTP.
 */
@Injectable({ providedIn: 'root' })
export class RecoveryAdvisorService {
  private readonly api = inject(RecoveryApiService);

  /** Historia objętości z (mockowanego) mikroserwisu. */
  readonly volumeHistory = toSignal(this.api.getVolumeHistory(), {
    initialValue: [] as WeeklyVolume[],
  });

  /** Ocena regeneracji – przelicza się automatycznie po napłynięciu danych. */
  readonly assessment = computed<RecoveryAssessment>(() => assessRecovery(this.volumeHistory()));

  /** Skrót dla szablonu – czy zalecany jest Deload. */
  readonly shouldDeload = computed(() => this.assessment().verdict === 'DELOAD');
}
