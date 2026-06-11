import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing-page').then((m) => m.LandingPageComponent),
    title: 'Hi-Lo Hand Betting',
  },
  {
    path: 'game',
    loadComponent: () => import('./features/game/game-page').then((m) => m.GamePageComponent),
    title: 'Hi-Lo Hand Betting — Game',
  },
  { path: '**', redirectTo: '' },
];
