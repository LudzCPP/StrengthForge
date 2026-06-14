import { InjectionToken } from '@angular/core';

/**
 * Token na Web Storage (localStorage).
 *
 * Dlaczego token zamiast bezpośredniego `localStorage`?
 * - Testowalność: w testach wstrzykujemy in-memory Storage zamiast globalu.
 * - Wymienność: repozytorium nie jest przyklejone do przeglądarki.
 */
export const LOCAL_STORAGE = new InjectionToken<Storage>('LOCAL_STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});
