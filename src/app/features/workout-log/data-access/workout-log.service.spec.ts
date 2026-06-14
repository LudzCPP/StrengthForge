import { TestBed } from '@angular/core/testing';
import { WorkoutLogEntry } from '../models/workout-log.model';
import { WorkoutLogRepository } from './workout-log.repository';
import { WorkoutLogService } from './workout-log.service';

class FakeRepository {
  initial: WorkoutLogEntry[] = [];
  saved: WorkoutLogEntry[] | null = null;
  load(): WorkoutLogEntry[] {
    return this.initial;
  }
  save(entries: readonly WorkoutLogEntry[]): void {
    this.saved = [...entries];
  }
}

function setup(repo = new FakeRepository()): { service: WorkoutLogService; repo: FakeRepository } {
  TestBed.configureTestingModule({
    providers: [WorkoutLogService, { provide: WorkoutLogRepository, useValue: repo }],
  });
  return { service: TestBed.inject(WorkoutLogService), repo };
}

describe('WorkoutLogService', () => {
  it('dodaje wpis i wylicza szacowany 1RM z ostatniego treningu', () => {
    const { service } = setup();
    service.addEntry({ exercise: 'BENCH_PRESS', sets: [{ weightKg: 80, reps: 5, rpe: 8 }] });

    expect(service.entries()).toHaveLength(1);
    // Epley: 80 * (1 + 5/30) = 93.3
    expect(service.estimatedOneRepMaxKg()).toBe(93.3);
  });

  it('szacuje 1RM z najnowszego wpisu, nie ze starszego', () => {
    const { service } = setup();
    service.addEntry({ date: '2026-06-01', exercise: 'BENCH_PRESS', sets: [{ weightKg: 70, reps: 5, rpe: 8 }] });
    service.addEntry({ date: '2026-06-14', exercise: 'BENCH_PRESS', sets: [{ weightKg: 85, reps: 3, rpe: 9 }] });

    expect(service.entriesNewestFirst()[0].date).toBe('2026-06-14');
    expect(service.estimatedOneRepMaxKg()).toBe(93.5); // 85 * (1 + 3/30)
  });

  it('usuwa wpis po id', () => {
    const { service } = setup();
    service.addEntry({ exercise: 'BENCH_PRESS', sets: [{ weightKg: 80, reps: 5, rpe: null }] });
    const id = service.entries()[0].id;

    service.removeEntry(id);
    expect(service.entries()).toHaveLength(0);
    expect(service.estimatedOneRepMaxKg()).toBeNull();
  });

  it('zasiewa stan z repozytorium przy starcie', () => {
    const repo = new FakeRepository();
    repo.initial = [
      { id: 'x', date: '2026-05-01', exercise: 'BENCH_PRESS', sets: [{ weightKg: 90, reps: 1, rpe: 10 }] },
    ];
    const { service } = setup(repo);
    expect(service.entries()).toHaveLength(1);
  });
});
