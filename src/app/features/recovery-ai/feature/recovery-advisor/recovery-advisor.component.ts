import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RecoveryAdvisorService } from '../../data-access/recovery-advisor.service';

/**
 * Komponent smart asystenta regeneracji.
 * Standalone + OnPush; czyta gotowy werdykt z fasady i renderuje go nowym Control Flow.
 */
@Component({
  selector: 'sf-recovery-advisor',
  imports: [DecimalPipe],
  templateUrl: './recovery-advisor.component.html',
  styleUrl: './recovery-advisor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryAdvisorComponent {
  private readonly advisor = inject(RecoveryAdvisorService);

  protected readonly volume = this.advisor.volumeHistory;
  protected readonly assessment = this.advisor.assessment;
}
