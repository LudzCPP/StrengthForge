import { computed, inject, Injectable } from '@angular/core';
import { AthleteProfileService } from '../../athlete-profile/data-access/athlete-profile.service';
import { RecoveryAdvisorService } from '../../recovery-ai/data-access/recovery-advisor.service';
import { buildProgressionRoadmap } from '../../strength-progression/models/progression.model';
import { analyzeProgress } from '../models/progress-outlook.model';

/**
 * Fasada coachingu AI – agreguje progresję i regenerację w jedną prognozę.
 *
 * To serwis "orkiestrujący": łączy domeny (jak dashboard, ale na poziomie danych).
 * Świadomie żyje w osobnej domenie `progress-coach`, żeby `strength-progression`
 * nie zależała od `recovery-ai` – zależność idzie tylko w górę, do agregatora.
 */
@Injectable({ providedIn: 'root' })
export class ProgressionCoachService {
  private readonly profile = inject(AthleteProfileService);
  private readonly recovery = inject(RecoveryAdvisorService);

  /** Pełna roadmapa cykli aż do celu – przelicza się przy zmianie 1RM lub celu. */
  readonly roadmap = computed(() =>
    buildProgressionRoadmap(this.profile.oneRepMaxKg(), this.profile.goalKg()),
  );

  /** Bieżąca analiza AI: tempo, ETA i werdykt z uwzględnieniem zmęczenia. */
  readonly outlook = computed(() =>
    analyzeProgress(
      this.profile.oneRepMaxKg(),
      this.profile.goalKg(),
      this.roadmap(),
      this.recovery.shouldDeload(),
    ),
  );
}
