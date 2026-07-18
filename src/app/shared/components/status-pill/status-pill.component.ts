import { Component, input } from '@angular/core';
import { Order } from '../../../core/models/dashboard.models';

const STYLES: Record<Order['status'], string> = {
  paid: 'bg-teal/10 text-teal',
  pending: 'bg-amber/15 text-amber-dark',
  refunded: 'bg-ink/10 text-ink/60',
  failed: 'bg-coral/10 text-coral',
};

@Component({
  selector: 'app-status-pill',
  standalone: true,
  template: `<span class="pill capitalize" [class]="styleClass()">{{ status() }}</span>`,
})
export class StatusPillComponent {
  status = input.required<Order['status']>();
  styleClass = () => STYLES[this.status()];
}
