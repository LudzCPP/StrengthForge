import { computed, inject, Injectable } from '@angular/core';
import { AthleteProfileService } from '../../athlete-profile/data-access/athlete-profile.service';
import {
  buildFiveThreeOnePlan,
  ProgressionPlan,
  roundToPlate,
  TRAINING_MAX_FACTOR,
} from '../models/progression.model';

/**
 * Fasada / store domeny progresji ("Road to 100kg").
 *
 * Po refaktorze NIE jest już właścicielem 1RM ani celu – czyta je z
 * `AthleteProfileService` (jedno źródło prawdy). Tutaj zostaje wyłącznie
 * logika progresji: Training Max, plan 5/3/1 i metryki celu jako czyste `computed()`.
 * Gdy user zmieni dane w formularzu, plan przelicza się sam.
 */
@Injectable({ providedIn: 'root' })
export class BenchPressProgressionService {
  private readonly profile = inject(AthleteProfileService);

  /** 1RM i cel pochodzą z globalnego profilu zawodnika. */
  readonly oneRepMaxKg = this.profile.oneRepMaxKg;
  readonly goalKg = this.profile.goalKg;

  /** Training Max = 90% 1RM, zaokrąglony do realnego obciążenia. */
  readonly trainingMaxKg = computed(() => roundToPlate(this.oneRepMaxKg() * TRAINING_MAX_FACTOR));

  /** Kompletny 3-tygodniowy plan 5/3/1 – przelicza się sam przy zmianie 1RM lub celu. */
  readonly plan = computed<ProgressionPlan>(() =>
    buildFiveThreeOnePlan(this.oneRepMaxKg(), this.trainingMaxKg(), this.goalKg()),
  );

  /** Najbliższa sesja treningowa (pierwszy tydzień mikrocyklu). */
  readonly nextSession = computed(() => this.plan().weeks[0]);

  /** Postęp do celu w procentach (0–100); odporny na cel = 0 podczas edycji. */
  readonly progressToGoalPercent = computed(() => {
    const goal = this.goalKg();
    return goal > 0 ? Math.min(100, Math.round((this.oneRepMaxKg() / goal) * 100)) : 0;
  });

  /** Ile kilogramów brakuje do celu (nigdy ujemne). */
  readonly kilogramsToGoal = computed(() =>
    Math.max(0, Math.round((this.goalKg() - this.oneRepMaxKg()) * 10) / 10),
  );
}
