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

  // Żądanie nieobsługiwane przez mock → przepuść dalej (do realnego backendu).
  return next(req);
};
