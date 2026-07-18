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
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
        title: 'Orders — Pulse',
      },
      //   {
      //     path: "customers",
      //     loadComponent: () =>
      //       import("./pages/placeholder/placeholder.component").then(
      //         (m) => m.PlaceholderComponent,
      //       ),
      //     title: "Customers — Pulse",
      //     data: { name: "Customers" },
      //   },
      //   {
      //     path: "products",
      //     loadComponent: () =>
      //       import("./pages/placeholder/placeholder.component").then(
      //         (m) => m.PlaceholderComponent,
      //       ),
      //     title: "Products — Pulse",
      //     data: { name: "Products" },
      //   },
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
