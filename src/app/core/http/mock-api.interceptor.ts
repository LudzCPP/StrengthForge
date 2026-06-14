import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

/**
 * Mock "mikroserwisu siłowego" na poziomie warstwy HTTP.
 *
 * Zamiast osobnego serwera na czas developmentu, interceptor przechwytuje
 * żądania do ścieżek `/api/strength/**` i zwraca syntetyczną odpowiedź z opóźnieniem,
 * symulując latencję sieci. Reszta aplikacji (HttpClient + RxJS) działa tak,
 * jakby rozmawiała z prawdziwym backendem – gdy pojawi się serwis w Javie,
 * usuwamy ten interceptor i nic więcej nie wymaga zmian.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.url.endsWith('/strength/bench-press/1rm')) {
    return of(
      new HttpResponse({
        status: 200,
        body: { exercise: 'BENCH_PRESS', oneRepMaxKg: 87.5 },
      }),
    ).pipe(delay(400));
  }

  if (req.method === 'GET' && req.url.endsWith('/recovery/volume-history')) {
    // Celowo rosnący tonaż i RPE – scenariusz akumulacji zmęczenia (→ Deload).
    return of(
      new HttpResponse({
        status: 200,
        body: [
          { week: 1, label: 'Tydzień 19', tonnageKg: 9000, hardSets: 10, avgRpe: 7.0 },
          { week: 2, label: 'Tydzień 20', tonnageKg: 9800, hardSets: 12, avgRpe: 7.5 },
          { week: 3, label: 'Tydzień 21', tonnageKg: 10500, hardSets: 13, avgRpe: 8.0 },
          { week: 4, label: 'Tydzień 22', tonnageKg: 11200, hardSets: 15, avgRpe: 8.5 },
          { week: 5, label: 'Tydzień 23', tonnageKg: 12000, hardSets: 17, avgRpe: 9.0 },
        ],
      }),
    ).pipe(delay(400));
  }

  // Żądanie nieobsługiwane przez mock → przepuść dalej (do realnego backendu).
  return next(req);
};
