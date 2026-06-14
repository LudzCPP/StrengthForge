import { TestBed } from '@angular/core/testing';
import { LOCAL_STORAGE } from '../../../core/storage/local-storage.token';
import { WorkoutLogEntry } from '../models/workout-log.model';
import { WorkoutLogRepository } from './workout-log.repository';

const STORAGE_KEY = 'strengthforge.workout-log.v1';

class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

function setup(): { repo: WorkoutLogRepository; storage: MemoryStorage } {
  const storage = new MemoryStorage();
  TestBed.configureTestingModule({
    providers: [WorkoutLogRepository, { provide: LOCAL_STORAGE, useValue: storage }],
  });
  return { repo: TestBed.inject(WorkoutLogRepository), storage };
}

const SAMPLE: WorkoutLogEntry = {
  id: '1',
  date: '2026-06-14',
  exercise: 'BENCH_PRESS',
  sets: [{ weightKg: 80, reps: 5, rpe: 8 }],
};

describe('WorkoutLogRepository', () => {
  it('zwraca pustą listę, gdy nic nie zapisano', () => {
    const { repo } = setup();
    expect(repo.load()).toEqual([]);
  });

  it('zapisuje i odczytuje wpisy (roundtrip)', () => {
    const { repo } = setup();
    repo.save([SAMPLE]);
    expect(repo.load()).toEqual([SAMPLE]);
  });

  it('odporne na uszkodzone dane w storage', () => {
    const { repo, storage } = setup();
    storage.setItem(STORAGE_KEY, '{ to nie jest json');
    expect(repo.load()).toEqual([]);
  });
});
