import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { BinMap } from './bin/bin-map/bin-map';
import { BinDetails } from './bin/bin-details/bin-details';
import { TourOverview } from './tour/tour-overview/tour-overview';
import { TourDetails } from './tour/tour-details/tour-details';
import { BinList } from './bin/bin-list/bin-list';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  { path: 'bin-map', component: BinMap },
  { path: 'bin-list', component: BinList },
  { path: 'bin/:id', component: BinDetails },
  { path: 'tour-overview', component: TourOverview },
  { path: 'tour/:id', component: TourDetails },
];
