import { InjectionToken } from '@angular/core';

/**
 * Bazowy URL bramy API (API Gateway) dla mockowanych mikroserwisów.
 *
 * Dlaczego token, a nie zaszyty string?
 * - Konfiguracja środowiskowa: inny adres na dev / prod / e2e bez zmiany kodu serwisów.
 * - Testowalność: w teście podmieniamy provider tokena zamiast mockować HttpClient na sztywno.
 * - Docelowo wskaże na bramę przed mikroserwisami w Javie/Spring Boot.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
