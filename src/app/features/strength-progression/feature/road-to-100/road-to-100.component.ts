import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { BenchPressProgressionService } from '../../data-access/bench-press-progression.service';

/**
 * Komponent "smart" (routowany) domeny progresji.
 *
 * - Standalone (domyślnie w Angularze 21) – własne `imports`, brak NgModule.
 * - `OnPush` + Signals: zmiana sygnału w fasadzie sama odświeża widok,
 *   bez ręcznego `markForCheck()` i bez subskrypcji do sprzątania.
 * - Komponent nie zawiera logiki domenowej – tylko czyta gotowe sygnały z fasady
 *   i eksponuje je jako `protected` dla szablonu (hermetyzacja).
 */
@Component({
  selector: 'sf-road-to-100',
  imports: [DecimalPipe, PercentPipe],
  templateUrl: './road-to-100.component.html',
  styleUrl: './road-to-100.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoadTo100Component {
  private readonly progression = inject(BenchPressProgressionService);

  protected readonly plan = this.progression.plan;
  protected readonly nextSession = this.progression.nextSession;
  protected readonly oneRepMax = this.progression.oneRepMaxKg;
  protected readonly trainingMax = this.progression.trainingMaxKg;
  protected readonly goal = this.progression.goalKg;
  protected readonly progressPercent = this.progression.progressToGoalPercent;
  protected readonly kilogramsToGoal = this.progression.kilogramsToGoal;
}
