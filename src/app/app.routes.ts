import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { BinMap } from './bin-map/bin-map';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'bin-map', component: BinMap }
];
