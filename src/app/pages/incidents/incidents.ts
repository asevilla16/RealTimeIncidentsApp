import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Incidents as IncidentsService } from '../../core/services/incidents';
import { IncidentSeverity, IncidentStatus } from '../../core/models/incident.model';
import { SeverityPillComponent } from '../../shared/components/severity-pill/severity-pill.component';
import { IncidentStatusPillComponent } from '../../shared/components/incident-status-pill/incident-status-pill.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

const SEVERITIES: IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: IncidentStatus[] = ['investigating', 'identified', 'monitoring', 'resolved'];

@Component({
  selector: 'app-incidents',
  imports: [
    DatePipe,
    RouterLink,
    SeverityPillComponent,
    IncidentStatusPillComponent,
    PaginationComponent,
  ],
  templateUrl: './incidents.html',
  styleUrl: './incidents.css',
})
export class Incidents {
  readonly incidentsService = inject(IncidentsService);

  readonly severities = SEVERITIES;
  readonly statuses = STATUSES;

  severityFilter = signal<IncidentSeverity | 'all'>('all');
  statusFilter = signal<IncidentStatus | 'all'>('all');
  searchQuery = signal('');

  readonly pageSizeOptions = [5, 10, 25, 50];
  pageSize = signal(5);
  private readonly rawPage = signal(1);

  filteredIncidents = computed(() => {
    const severity = this.severityFilter();
    const status = this.statusFilter();
    const search = this.searchQuery().trim().toLowerCase();

    return this.incidentsService
      .incidents()
      .filter((incident) => severity === 'all' || incident.severity === severity)
      .filter((incident) => status === 'all' || incident.status === status)
      .filter(
        (incident) =>
          !search ||
          incident.title.toLowerCase().includes(search) ||
          incident.description.toLowerCase().includes(search) ||
          incident.ownerName.toLowerCase().includes(search),
      );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredIncidents().length / this.pageSize())),
  );

  // Clamps the raw page against totalPages so a filter change that shrinks
  // the result set (or removes the current page) can't strand the view.
  currentPage = computed(() => Math.min(this.rawPage(), this.totalPages()));

  paginatedIncidents = computed(() => {
    const size = this.pageSize();
    const start = (this.currentPage() - 1) * size;
    return this.filteredIncidents().slice(start, start + size);
  });

  setSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.rawPage.set(1);
  }

  setSeverityFilter(value: IncidentSeverity | 'all'): void {
    this.severityFilter.set(value);
    this.rawPage.set(1);
  }

  setStatusFilter(value: IncidentStatus | 'all'): void {
    this.statusFilter.set(value);
    this.rawPage.set(1);
  }

  setPageSize(value: number): void {
    this.pageSize.set(value);
    this.rawPage.set(1);
  }

  goToPage(page: number): void {
    this.rawPage.set(Math.min(Math.max(1, page), this.totalPages()));
  }
}
