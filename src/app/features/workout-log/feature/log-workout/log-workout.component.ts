import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AthleteProfileService } from '../../../athlete-profile/data-access/athlete-profile.service';
import { BenchPressProgressionService } from '../../../strength-progression/data-access/bench-press-progression.service';
import { WorkoutLogService } from '../../data-access/workout-log.service';
import {
  entryEstimatedOneRepMax,
  entryTonnage,
  WorkoutLogEntry,
} from '../../models/workout-log.model';

interface DraftSet {
  weightKg: number;
  reps: number;
  rpe: number | null;
}

/**
 * Strona "Dziennik": logowanie wykonanych serii + historia + pętla zwrotna do profilu.
 *
 * Draft formularza trzymamy w lokalnych sygnałach (bez FormsModule). Zapisany trening
 * trafia do fasady dziennika, a z AMRAP szacujemy 1RM, który można jednym kliknięciem
 * zastosować do profilu – wtedy roadmapa i analiza AI przeliczają się reaktywnie.
 */
@Component({
  selector: 'sf-log-workout',
  imports: [DecimalPipe],
  templateUrl: './log-workout.component.html',
  styleUrl: './log-workout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogWorkoutComponent {
  private readonly log = inject(WorkoutLogService);
  private readonly profile = inject(AthleteProfileService);
  private readonly progression = inject(BenchPressProgressionService);

  protected readonly history = this.log.entriesNewestFirst;
  protected readonly estimatedOneRepMax = this.log.estimatedOneRepMaxKg;

  protected readonly date = signal(this.today());
  protected readonly draft = signal<DraftSet[]>([this.emptySet()]);

  protected readonly canSave = computed(() =>
    this.draft().some((row) => row.weightKg > 0 && row.reps > 0),
  );

  protected addRow(): void {
    this.draft.update((rows) => [...rows, this.emptySet()]);
  }

  protected removeRow(index: number): void {
    this.draft.update((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));
  }

  protected setWeight(index: number, value: string): void {
    this.patch(index, { weightKg: this.toNumber(value) });
  }

  protected setReps(index: number, value: string): void {
    this.patch(index, { reps: this.toNumber(value) });
  }

  protected setRpe(index: number, value: string): void {
    this.patch(index, { rpe: value.trim() === '' ? null : this.toNumber(value) });
  }

  /** Wczytuje serie z najbliższego zaplanowanego treningu (obciążenia + cele powtórzeń). */
  protected loadFromPlan(): void {
    const session = this.progression.nextSession();
    this.draft.set(
      session.mainSets.map((set) => ({ weightKg: set.weightKg, reps: set.targetReps, rpe: null })),
    );
  }

  protected save(): void {
    const sets = this.draft()
      .filter((row) => row.weightKg > 0 && row.reps > 0)
      .map((row) => ({ weightKg: row.weightKg, reps: row.reps, rpe: row.rpe }));

    if (sets.length === 0) {
      return;
    }

    this.log.addEntry({ date: this.date(), exercise: 'BENCH_PRESS', sets });
    this.draft.set([this.emptySet()]);
  }

  /** Pętla zwrotna: zastosuj szacowany 1RM z dziennika jako aktualny 1RM w profilu. */
  protected applyEstimateToProfile(): void {
    const estimate = this.estimatedOneRepMax();
    if (estimate) {
      this.profile.setOneRepMax(estimate);
    }
  }

  protected remove(id: string): void {
    this.log.removeEntry(id);
  }

  protected estimateFor(entry: WorkoutLogEntry): number {
    return entryEstimatedOneRepMax(entry);
  }

  protected tonnageFor(entry: WorkoutLogEntry): number {
    return entryTonnage(entry);
  }

  private patch(index: number, partial: Partial<DraftSet>): void {
    this.draft.update((rows) => rows.map((row, i) => (i === index ? { ...row, ...partial } : row)));
  }

  private toNumber(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  private emptySet(): DraftSet {
    return { weightKg: 0, reps: 0, rpe: null };
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
