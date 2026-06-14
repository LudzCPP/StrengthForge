import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AthleteProfileService } from '../../data-access/athlete-profile.service';

/**
 * Formularz danych zawodnika.
 *
 * Świadomie BEZ FormsModule/ngModel – wiązanie dwukierunkowe robimy "ręcznie"
 * na Signals: `[value]` czyta sygnał, `(input)` woła setter w storze. To podejście
 * w pełni reaktywne, zoneless-friendly i bez zależności od modułu formularzy.
 */
@Component({
  selector: 'sf-athlete-profile-form',
  imports: [DecimalPipe],
  templateUrl: './athlete-profile-form.component.html',
  styleUrl: './athlete-profile-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AthleteProfileFormComponent {
  private readonly profile = inject(AthleteProfileService);

  protected readonly bodyweight = this.profile.bodyweightKg;
  protected readonly oneRepMax = this.profile.oneRepMaxKg;
  protected readonly goal = this.profile.goalKg;
  protected readonly relativeStrength = this.profile.relativeStrengthRatio;

  protected updateBodyweight(value: string): void {
    this.profile.setBodyweight(this.toKg(value));
  }

  protected updateOneRepMax(value: string): void {
    this.profile.setOneRepMax(this.toKg(value));
  }

  protected updateGoal(value: string): void {
    this.profile.setGoal(this.toKg(value));
  }

  /** Bezpieczna konwersja wejścia tekstowego na kilogramy (pusty/NaN → 0). */
  private toKg(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }
}
