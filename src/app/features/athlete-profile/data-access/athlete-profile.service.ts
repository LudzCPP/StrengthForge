import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AthleteApiService } from './athlete-api.service';

/**
 * Globalny store profilu zawodnika – jedno źródło prawdy dla całej aplikacji.
 *
 * Trzyma dane edytowalne przez użytkownika (waga, 1RM, cel). 1RM jest zasiewany
 * z backendu, ale użytkownik może go nadpisać (ręczne nadpisanie ma priorytet).
 * Inne domeny (progresja, dashboard) tylko CZYTAJĄ z tego serwisu – dzięki temu
 * zmiana wartości w formularzu reaktywnie przelicza plan i metryki wszędzie.
 */
@Injectable({ providedIn: 'root' })
export class AthleteProfileService {
  private readonly api = inject(AthleteApiService);

  /** 1RM potwierdzony przez (mockowany) mikroserwis – wartość zasiewająca. */
  private readonly confirmedOneRepMax = toSignal(this.api.getConfirmedOneRepMax(), {
    initialValue: 87.5,
  });

  /** Ręczne nadpisanie 1RM z formularza – priorytet nad backendem. */
  private readonly manualOneRepMax = signal<number | null>(null);

  private readonly bodyweight = signal(82);
  private readonly goal = signal(100);

  readonly oneRepMaxKg = computed(() => this.manualOneRepMax() ?? this.confirmedOneRepMax());
  readonly bodyweightKg = this.bodyweight.asReadonly();
  readonly goalKg = this.goal.asReadonly();

  /** Siła względna = 1RM / masa ciała (klasyczny wskaźnik poziomu zaawansowania). */
  readonly relativeStrengthRatio = computed(() => {
    const bw = this.bodyweight();
    return bw > 0 ? Math.round((this.oneRepMaxKg() / bw) * 100) / 100 : 0;
  });

  setOneRepMax(valueKg: number): void {
    this.manualOneRepMax.set(valueKg);
  }

  setBodyweight(valueKg: number): void {
    this.bodyweight.set(valueKg);
  }

  setGoal(valueKg: number): void {
    this.goal.set(valueKg);
  }
}
