import { Component, computed, input } from '@angular/core';
import { StatCard } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="card flex flex-col gap-3 p-5">
      <div class="flex items-start justify-between">
        <p class="text-xs font-medium uppercase tracking-wide text-ink/45">{{ stat().label }}</p>
        <span class="pill" [class]="deltaClass()">
          {{ stat().delta >= 0 ? '+' : '' }}{{ stat().delta }}%
        </span>
      </div>

      <p class="stat-figure text-2xl font-medium text-ink">{{ stat().value }}</p>

      <svg [attr.viewBox]="'0 0 100 28'" class="h-7 w-full" preserveAspectRatio="none">
        <polyline
          [attr.points]="sparkPoints()"
          fill="none"
          [attr.stroke]="stat().delta >= 0 ? '#2F6F62' : '#E1604C'"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>
  `,
})
export class StatCardComponent {
  stat = input.required<StatCard>();

  deltaClass = computed(() =>
    this.stat().delta >= 0 ? 'bg-teal/10 text-teal' : 'bg-coral/10 text-coral',
  );

  sparkPoints = computed(() => {
    const values = this.stat().spark;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const stepX = 100 / (values.length - 1);
    return values
      .map((v, i) => {
        const x = i * stepX;
        const y = 26 - ((v - min) / range) * 24;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });
}
