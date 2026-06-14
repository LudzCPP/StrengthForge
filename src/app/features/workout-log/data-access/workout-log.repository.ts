import { inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from '../../../core/storage/local-storage.token';
import { WorkoutLogEntry } from '../models/workout-log.model';

const STORAGE_KEY = 'strengthforge.workout-log.v1';

/**
 * Repozytorium dziennika treningu (persystencja).
 *
 * Ukrywa szczegół składowania (localStorage) za prostym kontraktem load/save.
 * Gdy pojawi się backend w Javie, podmieniamy tylko tę klasę na klienta HTTP –
 * fasada i UI pozostają bez zmian (wzorzec Repository).
 */
@Injectable({ providedIn: 'root' })
export class WorkoutLogRepository {
  private readonly storage = inject(LOCAL_STORAGE);

  load(): WorkoutLogEntry[] {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as WorkoutLogEntry[]) : [];
    } catch {
      // Uszkodzone dane nie powinny wywalać aplikacji – startujemy od pustego dziennika.
      return [];
    }
  }

  save(entries: readonly WorkoutLogEntry[]): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}
