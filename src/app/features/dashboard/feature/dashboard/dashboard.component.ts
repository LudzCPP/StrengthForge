import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AthleteProfileService } from '../../../athlete-profile/data-access/athlete-profile.service';
import { AthleteProfileFormComponent } from '../../../athlete-profile/feature/athlete-profile-form/athlete-profile-form.component';
import { BenchPressProgressionService } from '../../../strength-progression/data-access/bench-press-progression.service';
import { RecoveryAdvisorService } from '../../../recovery-ai/data-access/recovery-advisor.service';
import { ProgressionCoachService } from '../../../progress-coach/data-access/progression-coach.service';

/**
 * Dashboard – widok startowy agregujący wszystkie domeny.
 *
 * To komponent "orkiestrujący": składa formularz profilu i podsumowania
 * z fasad progresji i regeneracji. Sam nie ma logiki domenowej – tylko czyta
 * sygnały. Zmiana danych w formularzu od razu odświeża karty (jedno źródło prawdy).
 */
@Component({
  selector: 'sf-dashboard',
  imports: [DecimalPipe, LowerCasePipe, RouterLink, AthleteProfileFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly profile = inject(AthleteProfileService);
  private readonly progression = inject(BenchPressProgressionService);
  private readonly recovery = inject(RecoveryAdvisorService);
  private readonly coach = inject(ProgressionCoachService);

  protected readonly outlook = this.coach.outlook;
  protected readonly oneRepMax = this.profile.oneRepMaxKg;
  protected readonly goal = this.profile.goalKg;
  protected readonly trainingMax = this.progression.trainingMaxKg;
  protected readonly progressPercent = this.progression.progressToGoalPercent;
  protected readonly kilogramsToGoal = this.progression.kilogramsToGoal;
  protected readonly nextSession = this.progression.nextSession;
  protected readonly assessment = this.recovery.assessment;
}
