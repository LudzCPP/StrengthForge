import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { ProgressionCoachService } from '../../data-access/progression-coach.service';

/**
 * Strona "Plan do celu": analiza AI (outlook) + pełna oś cykli 5/3/1 aż do celu.
 * Standalone + OnPush; czyta gotowe sygnały z fasady coacha.
 */
@Component({
  selector: 'sf-roadmap',
  imports: [DecimalPipe, LowerCasePipe],
  templateUrl: './roadmap.component.html',
  styleUrl: './roadmap.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoadmapComponent {
  private readonly coach = inject(ProgressionCoachService);

  protected readonly roadmap = this.coach.roadmap;
  protected readonly outlook = this.coach.outlook;
}
