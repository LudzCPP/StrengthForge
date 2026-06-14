import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  entryEstimatedOneRepMax,
  LoggedSet,
  sortNewestFirst,
  WorkoutLogEntry,
} from '../models/workout-log.model';
import { WorkoutLogRepository } from './workout-log.repository';

/** Dane wejściowe nowego wpisu (id i datę uzupełnia serwis). */
export interface NewWorkoutLog {
  readonly date?: string;
  readonly exercise: string;
  readonly sets: readonly LoggedSet[];
  readonly note?: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Fasada dziennika treningu.
 *
 * Stan to sygnał wpisów zasiany z repozytorium. Każda zmiana jest automatycznie
 * persystowana przez `effect` (jeden punkt zapisu – brak rozsianych save()).
 * Z surowych danych liczymy `computed`: historię i szacowany 1RM z ostatniego treningu.
 */
@Injectable({ providedIn: 'root' })
export class WorkoutLogService {
  private readonly repo = inject(WorkoutLogRepository);

  private readonly _entries = signal<WorkoutLogEntry[]>(this.repo.load());

  readonly entries = this._entries.asReadonly();
  readonly entriesNewestFirst = computed(() => sortNewestFirst(this._entries()));

  /** Szacowany aktualny 1RM na podstawie ostatniego (najnowszego) treningu. */
  readonly estimatedOneRepMaxKg = computed<number | null>(() => {
    const latest = this.entriesNewestFirst()[0];
    return latest ? entryEstimatedOneRepMax(latest) : null;
  });

  constructor() {
    // Persystencja stanu przy każdej zmianie – pojedyncze źródło zapisu.
    effect(() => this.repo.save(this._entries()));
  }

  addEntry(input: NewWorkoutLog): void {
    const entry: WorkoutLogEntry = {
      id: newId(),
      date: input.date?.trim() || todayIso(),
      exercise: input.exercise,
      sets: input.sets,
      note: input.note,
    };
    this._entries.update((entries) => [...entries, entry]);
  }

  removeEntry(id: string): void {
    this._entries.update((entries) => entries.filter((entry) => entry.id !== id));
  }
}
