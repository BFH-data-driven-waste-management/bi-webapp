import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { BinMap } from './bin-map/bin-map';
import { BinDetails } from './bin-details/bin-details';
import { binResolver } from './bin/bin.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'bin-map', component: BinMap },
  { path: 'bin/:coordX/:coordY', component: BinDetails, resolve: { bin: binResolver } }
];
