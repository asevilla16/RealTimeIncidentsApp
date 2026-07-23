import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivateChild: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Overview — Pulse',
      },
      {
        path: 'incidents',
        loadComponent: () => import('./pages/incidents/incidents').then((m) => m.Incidents),
        title: 'Incidents — Pulse',
      },
      {
        path: 'incidents/:id',
        loadComponent: () =>
          import('./pages/incident-detail/incident-detail').then((m) => m.IncidentDetail),
        title: 'Incident — Pulse',
      },
      //   {
      //     path: "settings",
      //     loadComponent: () =>
      //       import("./pages/placeholder/placeholder.component").then(
      //         (m) => m.PlaceholderComponent,
      //       ),
      //     title: "Settings — Pulse",
      //     data: { name: "Settings" },
      //   },
    ],
  },
  {
    path: '',
    canActivateChild: [guestGuard],
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then((m) => m.Login),
        title: 'Login — Pulse',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
