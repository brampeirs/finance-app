import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/balances',
    pathMatch: 'full',
  },
  {
    path: 'balances',
    loadComponent: () =>
      import('./components/balance-list/balance-list.component').then(
        (m) => m.BalanceListComponent
      ),
  },
  {
    path: 'balance/add',
    loadComponent: () =>
      import('./components/add-balance/add-balance.component').then((m) => m.AddBalanceComponent),
  },
  {
    path: 'metrics',
    loadComponent: () =>
      import('./components/metrics/metrics.component').then((m) => m.MetricsComponent),
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat.component').then((m) => m.ChatComponent),
  },
  {
    path: '**',
    redirectTo: '/balances',
  },
];
