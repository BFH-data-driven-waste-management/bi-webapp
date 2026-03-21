import { Component, inject } from '@angular/core';
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
    if (url.startsWith('/tours')) return 'pr-4';
    if (url.startsWith('/bin-map')) return '';
    return 'p-6';
  }
}
