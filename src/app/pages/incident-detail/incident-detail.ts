import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Incidents } from '../../core/services/incidents';
import { Auth } from '../../auth/services/auth';
import { IncidentUpdate } from '../../core/models/incident.model';
import { SeverityPillComponent } from '../../shared/components/severity-pill/severity-pill.component';
import { IncidentStatusPillComponent } from '../../shared/components/incident-status-pill/incident-status-pill.component';

@Component({
  selector: 'app-incident-detail',
  imports: [DatePipe, RouterLink, FormsModule, SeverityPillComponent, IncidentStatusPillComponent],
  templateUrl: './incident-detail.html',
  styleUrl: './incident-detail.css',
})
export class IncidentDetail {
  private readonly incidentsService = inject(Incidents);
  private readonly auth = inject(Auth);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);

  // Bound from the ':id' route segment via withComponentInputBinding().
  id = input.required<string>();

  incident = computed(() => this.incidentsService.incidents().find((i) => i.id === this.id()));
  isLoadingIncident = this.incidentsService.isLoading;

  private readonly _updates = signal<IncidentUpdate[]>([]);
  readonly updates = this._updates.asReadonly();
  readonly isLoadingUpdates = signal(true);

  updateMessage = signal('');
  isPostingUpdate = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        effect(
          (onCleanup) => {
            const incidentId = this.id();
            this._updates.set([]);
            this.isLoadingUpdates.set(true);

            const unsubscribe = this.incidentsService.watchIncidentUpdates(
              incidentId,
              (updates) => {
                this._updates.set(updates);
                this.isLoadingUpdates.set(false);
              },
            );

            onCleanup(unsubscribe);
          },
          { injector: this.injector },
        );
      });
    }
  }

  async submitUpdate(): Promise<void> {
    const incident = this.incident();
    const message = this.updateMessage().trim();
    if (!incident || !message) return;

    const authorName = this.auth.user()?.name || 'You';

    this.isPostingUpdate.set(true);
    try {
      await this.incidentsService.addUpdate(incident.id, authorName, message);
      this.updateMessage.set('');
    } catch (error) {
      console.error('Failed to post incident update:', error);
    } finally {
      this.isPostingUpdate.set(false);
    }
  }
}
