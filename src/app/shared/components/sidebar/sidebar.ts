import { Component, signal } from '@angular/core';
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
  mainNav = signal<NavItem[]>([
    {
      label: 'Dashboard',
      path: '/',
      icon: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
    },
    {
      label: 'Orders',
      path: '/orders',
      icon: 'M4 7h16M6 7l1.5 12h9L18 7M9 11v4m6-4v4',
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: 'M16 14a4 4 0 1 0-8 0m9 7v-1a5 5 0 0 0-5-5H12a5 5 0 0 0-5 5v1',
    },
    {
      label: 'Products',
      path: '/products',
      icon: 'M21 8 12 3 3 8l9 5 9-5ZM3 8v8l9 5m0-13v13m9-13v8l-9 5',
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
