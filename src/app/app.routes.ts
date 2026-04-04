import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { tourResolver, toursResolver } from './tour/tour.resolver';
import { BinMap } from './bin/bin-map/bin-map';
import { BinDetails } from './bin/bin-details/bin-details';
import { ToursOverview } from './tour/tours-overview/tours-overview';
import { TourDetails } from './tour/tour-details/tour-details';
import { binResolver } from './bin/bin.resolver';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  { path: 'bin-map', component: BinMap },
  { path: 'bin/:coordX/:coordY', component: BinDetails, resolve: { bin: binResolver } },
  { path: 'tours-overview', component: ToursOverview, resolve: { firstPage: toursResolver } },
  { path: 'tour/:id', component: TourDetails, resolve: { tour: tourResolver } },
];
