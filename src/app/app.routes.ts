import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/videos/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'videos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/videos/pages/video-detail/video-detail.component').then(m => m.VideoDetailComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
