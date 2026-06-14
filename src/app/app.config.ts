import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { apiLoggingInterceptor } from './core/http/api-logging.interceptor';
import { mockApiInterceptor } from './core/http/mock-api.interceptor';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Kolejność interceptorów = kolejność wykonania.
    // Logowanie opakowuje mock, więc widzimy też ruch obsłużony lokalnie.
    provideHttpClient(withInterceptors([apiLoggingInterceptor, mockApiInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
