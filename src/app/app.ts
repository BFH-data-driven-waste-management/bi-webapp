import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Toolbar } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, Toolbar, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  get navItems(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        routerLink: '/dashboard',
      },
      {
        label: 'Eimer-Netz',
        icon: 'pi pi-trash',
        routerLink: '/bins',
      },
      {
        label: 'Touren',
        icon: 'pi pi-map',
        routerLink: '/tours',
      },
    ];
  }
}
