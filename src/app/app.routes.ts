import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard) },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  { path: 'bin-map', loadComponent: () => import('./bin/bin-map/bin-map').then((m) => m.BinMap) },
  {
    path: 'bin-list',
    loadComponent: () => import('./bin/bin-list/bin-list').then((m) => m.BinList),
  },
  {
    path: 'bin/:id',
    loadComponent: () => import('./bin/bin-details/bin-details').then((m) => m.BinDetails),
  },
  {
    path: 'tour-overview',
    loadComponent: () => import('./tour/tour-overview/tour-overview').then((m) => m.TourOverview),
  },
  {
    path: 'tour/:id',
    loadComponent: () => import('./tour/tour-details/tour-details').then((m) => m.TourDetails),
  },
];
