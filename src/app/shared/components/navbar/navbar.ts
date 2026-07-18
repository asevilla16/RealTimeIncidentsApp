import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../auth/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  menuToggle = output<void>();

  private router = inject(Router);

  private readonly auth = inject(Auth);

  public readonly loggedUser = this.auth.user;

  menuOpen = signal(false);

  readonly lastSynced = signal(
    new Date().toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
  );

  toggleMenu() {
    this.menuOpen.update((open) => !open);
  }

  async handleAction(action: string) {
    this.menuOpen.set(false);

    console.log('Topbar action:', action);
  }

  async logout() {
    await this.auth.signOut();
    await this.router.navigate(['/login']);
  }
}
