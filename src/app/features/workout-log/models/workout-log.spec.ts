import {
  entryEstimatedOneRepMax,
  entryTonnage,
  sortNewestFirst,
  WorkoutLogEntry,
} from './workout-log.model';

function entry(partial: Partial<WorkoutLogEntry> & Pick<WorkoutLogEntry, 'id' | 'date' | 'sets'>): WorkoutLogEntry {
  return { exercise: 'BENCH_PRESS', ...partial };
}

describe('workout-log model', () => {
  it('estymuje 1RM (Epley) z najlepszej serii treningu', () => {
    const e = entry({
      id: '1',
      date: '2026-06-14',
      sets: [
        { weightKg: 80, reps: 5, rpe: 8 },
        { weightKg: 85, reps: 3, rpe: 9 },
      ],
    });
    // Epley: 85 * (1 + 3/30) = 93.5; 80 * (1 + 5/30) = 93.3 → max = 93.5
    expect(entryEstimatedOneRepMax(e)).toBe(93.5);
  });

  it('liczy tonaż jako Σ obciążenie × powtórzenia', () => {
    const e = entry({
      id: '1',
      date: '2026-06-14',
      sets: [
        { weightKg: 80, reps: 5, rpe: null },
        { weightKg: 60, reps: 10, rpe: null },
      ],
    });
    expect(entryTonnage(e)).toBe(80 * 5 + 60 * 10);
  });

  it('sortuje wpisy od najnowszego', () => {
    const a = entry({ id: 'a', date: '2026-06-10', sets: [] });
    const b = entry({ id: 'b', date: '2026-06-14', sets: [] });
    expect(sortNewestFirst([a, b]).map((x) => x.id)).toEqual(['b', 'a']);
  });
});
