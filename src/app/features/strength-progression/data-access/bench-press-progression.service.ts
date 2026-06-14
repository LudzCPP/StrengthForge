import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  buildFiveThreeOnePlan,
  ProgressionPlan,
  roundToPlate,
  TRAINING_MAX_FACTOR,
} from '../models/progression.model';
import { ProgressionApiService } from './progression-api.service';

/**
 * Fasada / store domeny progresji ("Road to 100kg").
 *
 * Wzorzec Facade: jeden punkt prawdy dla widoków. Komponenty NIE znają HttpClient,
 * RxJS ani algorytmu 5/3/1 – dostają gotowe, reaktywne sygnały tylko-do-odczytu.
 *
 * Most RxJS → Signals:
 *  - źródło asynchroniczne (mikroserwis) przychodzi jako Observable,
 *  - `toSignal()` zamienia je na sygnał z wartością początkową (brak migotania UI),
 *  - cała reszta stanu to czyste `computed()` – samo-przeliczalne i bez subskrypcji do sprzątania.
 */
@Injectable({ providedIn: 'root' })
export class BenchPressProgressionService {
  private readonly api = inject(ProgressionApiService);

  /** Potwierdzony 1RM z (mockowanego) mikroserwisu. Wartość startowa = ostatni znany rekord. */
  private readonly confirmedOneRepMax = toSignal(this.api.getConfirmedOneRepMax(), {
    initialValue: 87.5,
  });

  /** Ręczne nadpisanie 1RM (np. user zalogował nowy rekord) – ma priorytet nad backendem. */
  private readonly manualOneRepMax = signal<number | null>(null);

  /** Cel projektu – domyślnie magiczne 100 kg. */
  private readonly goal = signal(100);

  /** Efektywny 1RM: ręczne nadpisanie > wartość z backendu. */
  readonly oneRepMaxKg = computed(() => this.manualOneRepMax() ?? this.confirmedOneRepMax());

  readonly goalKg = this.goal.asReadonly();

  /** Training Max = 90% 1RM, zaokrąglony do realnego obciążenia. */
  readonly trainingMaxKg = computed(() => roundToPlate(this.oneRepMaxKg() * TRAINING_MAX_FACTOR));

  /** Kompletny 3-tygodniowy plan 5/3/1 – przelicza się sam, gdy zmieni się 1RM lub cel. */
  readonly plan = computed<ProgressionPlan>(() =>
    buildFiveThreeOnePlan(this.oneRepMaxKg(), this.trainingMaxKg(), this.goalKg()),
  );

  /** Najbliższa sesja treningowa (pierwszy tydzień mikrocyklu). */
  readonly nextSession = computed(() => this.plan().weeks[0]);

  /** Postęp do celu w procentach (0–100). */
  readonly progressToGoalPercent = computed(() =>
    Math.min(100, Math.round((this.oneRepMaxKg() / this.goalKg()) * 100)),
  );

  /** Ile kilogramów brakuje do celu (nigdy ujemne). */
  readonly kilogramsToGoal = computed(() =>
    Math.max(0, Math.round((this.goalKg() - this.oneRepMaxKg()) * 10) / 10),
  );

  /** Zaloguj nowy potwierdzony rekord 1RM (przelicza cały plan reaktywnie). */
  setConfirmedOneRepMax(valueKg: number): void {
    this.manualOneRepMax.set(valueKg);
  }

  /** Zmień docelowy ciężar projektu. */
  setGoal(valueKg: number): void {
    this.goal.set(valueKg);
  }
}
