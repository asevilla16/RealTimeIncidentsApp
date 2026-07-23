import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string; // inline SVG path data
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

  secondaryNav = signal<NavItem[]>([
    {
      label: 'Settings',
      path: '/settings',
      icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-3a7 7 0 0 1-.1 1.2l2 1.6-2 3.4-2.3-.9a7 7 0 0 1-2 1.2L14 22h-4l-.6-2.5a7 7 0 0 1-2-1.2l-2.3.9-2-3.4 2-1.6A7 7 0 0 1 5 12a7 7 0 0 1 .1-1.2l-2-1.6 2-3.4 2.3.9a7 7 0 0 1 2-1.2L10 2h4l.6 2.5a7 7 0 0 1 2 1.2l2.3-.9 2 3.4-2 1.6c.07.4.1.8.1 1.2Z',
    },
  ]);
}
