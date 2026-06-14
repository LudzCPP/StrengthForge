import { estimateOneRepMax } from '../../strength-progression/models/progression.model';

/** Pojedyncza wykonana seria robocza. */
export interface LoggedSet {
  readonly weightKg: number;
  readonly reps: number;
  /** Subiektywna ciężkość 1–10; null gdy nie podano. */
  readonly rpe: number | null;
}

/** Zapisany trening (jedna sesja danego boju). */
export interface WorkoutLogEntry {
  readonly id: string;
  /** Data w formacie YYYY-MM-DD. */
  readonly date: string;
  readonly exercise: string;
  readonly sets: readonly LoggedSet[];
  readonly note?: string;
}

/** Najlepszy szacowany 1RM (Epley) w obrębie jednego treningu. */
export function entryEstimatedOneRepMax(entry: WorkoutLogEntry): number {
  if (entry.sets.length === 0) {
    return 0;
  }
  return Math.max(...entry.sets.map((set) => estimateOneRepMax(set.weightKg, set.reps)));
}

/** Łączny tonaż treningu (Σ obciążenie × powtórzenia). */
export function entryTonnage(entry: WorkoutLogEntry): number {
  return entry.sets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
}

/** Wpisy posortowane od najnowszego (po dacie, a przy remisie po id). */
export function sortNewestFirst(entries: readonly WorkoutLogEntry[]): WorkoutLogEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
