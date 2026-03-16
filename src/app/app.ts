import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Toolbar } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, Toolbar, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);

  readonly navItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-bar',
      routerLink: '/dashboard',
    },
    {
      label: 'Behälterkarte',
      icon: 'pi pi-trash',
      routerLink: '/bin-map',
    },
    {
      label: 'Touren',
      icon: 'pi pi-map',
      routerLink: '/tours',
    },
  ];

  readonly isBinMapRoute = toSignal( // TODO maybe there is a better solution
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/bin-map')),
      startWith(this.router.url.startsWith('/bin-map')),
    ),
    { initialValue: this.router.url.startsWith('/bin-map') },
  );
}
