import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Pulpit · StrengthForge',
    loadComponent: () =>
      import('./features/dashboard/feature/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'road-to-100',
    title: 'Road to 100 kg · StrengthForge',
    // Lazy-loaded standalone component – kod domeny ładuje się on-demand,
    // co utrzymuje mały bundle startowy (ważne dla PWA).
    loadComponent: () =>
      import('./features/strength-progression/feature/road-to-100/road-to-100.component').then(
        (m) => m.RoadTo100Component,
      ),
  },
  {
    path: 'roadmap',
    title: 'Plan do celu · StrengthForge',
    loadComponent: () =>
      import('./features/progress-coach/feature/roadmap/roadmap.component').then(
        (m) => m.RoadmapComponent,
      ),
  },
  {
    path: 'recovery',
    title: 'Asystent regeneracji · StrengthForge',
    loadComponent: () =>
      import('./features/recovery-ai/feature/recovery-advisor/recovery-advisor.component').then(
        (m) => m.RecoveryAdvisorComponent,
      ),
  },
];
