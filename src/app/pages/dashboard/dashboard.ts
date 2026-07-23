import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BarChartComponent } from '../../shared/components/bar-chart/bar-chart.component';
import { SeverityPillComponent } from '../../shared/components/severity-pill/severity-pill.component';
import { IncidentStatusPillComponent } from '../../shared/components/incident-status-pill/incident-status-pill.component';
import { Incidents } from '../../core/services/incidents';

@Component({
  selector: 'app-dashboard',
  imports: [
    BarChartComponent,
    SeverityPillComponent,
    IncidentStatusPillComponent,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly incidentsService = inject(Incidents);

  isLoading = this.incidentsService.isLoading;
  isLoadingRecentUpdates = this.incidentsService.isLoadingRecentUpdates;

  activeIncidents = this.incidentsService.activeIncidents;
  criticalCount = this.incidentsService.criticalCount;
  investigatingCount = this.incidentsService.investigatingCount;
  resolvedThisWeek = this.incidentsService.resolvedThisWeek;
  severityBreakdown = this.incidentsService.severityBreakdown;
  recentUpdates = this.incidentsService.recentUpdates;

  visibleUpdates = computed(() => this.recentUpdates().slice(0, 3));
  totalIncidents = computed(() => this.incidentsService.incidents().length);
}
