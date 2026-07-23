import { Component, input } from '@angular/core';
import { IncidentSeverity } from '../../../core/models/incident.model';

const STYLES: Record<IncidentSeverity, string> = {
  critical: 'bg-coral/10 text-coral',
  high: 'bg-amber/15 text-amber-dark',
  medium: 'bg-amber/10 text-amber-dark',
  low: 'bg-teal/10 text-teal',
};

@Component({
  selector: 'app-severity-pill',
  standalone: true,
  template: `<span class="pill capitalize" [class]="styleClass()">{{ severity() }}</span>`,
})
export class SeverityPillComponent {
  severity = input.required<IncidentSeverity>();
  styleClass = () => STYLES[this.severity()];
}
