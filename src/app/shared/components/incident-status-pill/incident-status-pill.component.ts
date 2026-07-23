import { Component, input } from '@angular/core';
import { IncidentStatus } from '../../../core/models/incident.model';

const STYLES: Record<IncidentStatus, string> = {
  investigating: 'bg-coral/10 text-coral',
  identified: 'bg-amber/15 text-amber-dark',
  monitoring: 'bg-amber/10 text-amber-dark',
  resolved: 'bg-teal/10 text-teal',
};

@Component({
  selector: 'app-incident-status-pill',
  standalone: true,
  template: `<span class="pill capitalize" [class]="styleClass()">{{ status() }}</span>`,
})
export class IncidentStatusPillComponent {
  status = input.required<IncidentStatus>();
  styleClass = () => STYLES[this.status()];
}
