import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Tours } from './tour/tours';
import { toursResolver } from './tour/tours-resolver';
import { BinMap } from './bin/bin-map/bin-map';
import { BinDetails } from './bin/bin-details/bin-details';
import { binResolver } from './bin/bin-details/bin.resolver';
import { binsResolver } from './bin/bin-map/bins-resolver';

export const routes: Routes = [
  { path: '', component: Dashboard, resolve: { bins: binsResolver } },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  { path: 'bin-map', component: BinMap, resolve: { bins: binsResolver } },
  { path: 'bin/:coordX/:coordY', component: BinDetails, resolve: { bin: binResolver } },
  { path: 'tours', component: Tours, resolve: { tours: toursResolver } },
];
