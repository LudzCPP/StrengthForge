import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

/**
 * Funkcyjny interceptor (Angular 15+) – loguje czas trwania każdego żądania HTTP.
 *
 * To miejsce na cross-cutting concerns wspólne dla wszystkich mikroserwisów:
 * korelacja requestów, telemetria, obsługa błędów, nagłówki Authorization itp.
 * Trzymamy je w `core/http`, bo to infrastruktura aplikacji – nie należy do żadnej domeny.
 */
export const apiLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startedAt = performance.now();

  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        const durationMs = Math.round(performance.now() - startedAt);
        console.debug(`[HTTP] ${req.method} ${req.urlWithParams} → ${event.status} (${durationMs} ms)`);
      }
    }),
  );
};
