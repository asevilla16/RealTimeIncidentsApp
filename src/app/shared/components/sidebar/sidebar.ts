import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isOpen = input(false);
  closeSidebar = output<void>();

  mainNav = signal<NavItem[]>([
    {
      label: 'Overview',
      path: '/',
      icon: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
    },
    {
      label: 'Incidents',
      path: '/incidents',
      icon: 'M12 9v4m0 4h.01M10.3 3.9 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
    },
  ]);
}
