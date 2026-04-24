import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Toolbar } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, Toolbar, FormsModule, NgClass],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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
      label: 'Touren',
      icon: 'pi pi-truck',
      routerLink: '/tour-overview',
    },
    {
      label: 'Behälterkarte',
      icon: 'pi pi-map',
      routerLink: '/bin-map',
    },
    {
      label: 'Behälterliste', // TODO eventuell umbenennen in Behälteroptimierung?
      icon: 'pi pi-list',
      routerLink: '/bin-list',
    },
  ];

  readonly linkItems: MenuItem[] = [
    {
      label: 'WebGIS Biel',
      icon: 'pi pi-external-link',
      url: 'https://biel-bienne.mapplus.ch/',
      target: '_blank',
    },
    {
      label: 'Strasseninspektorat',
      icon: 'pi pi-external-link',
      url: 'https://www.biel-bienne.ch/de/strasseninspektorat.html/850',
      target: '_blank',
    },
  ];

  readonly routePaddingClass = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.getRoutePaddingClass(this.router.url)),
      startWith(this.getRoutePaddingClass(this.router.url)),
    ),
    { initialValue: this.getRoutePaddingClass(this.router.url) },
  );

  private getRoutePaddingClass(url: string): string {
    if (url.startsWith('/bin-map')) return 'pt-4 pr-4';
    return 'py-4 pr-4';
  }
}
