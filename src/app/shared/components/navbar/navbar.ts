import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  inject,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
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
  private readonly platformId = inject(PLATFORM_ID);

  private readonly auth = inject(Auth);

  public readonly loggedUser = this.auth.user;

  readonly userInitials = computed(() => {
    const name = this.loggedUser()?.name?.trim();
    if (name) {
      const parts = name.split(/\s+/);
      return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    }
    return this.loggedUser()?.email?.[0]?.toUpperCase() ?? '?';
  });

  menuOpen = signal(false);

  // Empty on both server and initial client render so SSR output and the
  // pre-hydration client DOM match exactly; the real value is only computed
  // in the browser, after hydration, via afterNextRender. Computing
  // `new Date()` at construction time would run once on the server (server
  // clock/timezone) and again on the client during hydration (browser
  // clock/timezone), which almost always disagree and trips a hydration
  // content mismatch.
  readonly lastSynced = signal('');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.lastSynced.set(
          new Date().toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
        );
      });
    }
  }

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
