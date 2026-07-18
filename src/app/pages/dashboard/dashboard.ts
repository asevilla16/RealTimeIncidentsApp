import { Component, signal } from '@angular/core';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BarChartComponent, BarDatum } from '../../shared/components/bar-chart/bar-chart.component';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivityItem, Order, StatCard } from '../../core/models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatCardComponent,
    BarChartComponent,
    StatusPillComponent,
    CurrencyPipe,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  stats = signal<StatCard[]>([
    { label: 'Revenue', value: '$84,204', delta: 12.4, spark: [8, 10, 9, 13, 12, 16, 18] },
    { label: 'Orders', value: '1,284', delta: 6.1, spark: [4, 6, 5, 7, 8, 7, 9] },
    { label: 'Active customers', value: '9,532', delta: -2.3, spark: [12, 11, 12, 10, 9, 9, 8] },
    { label: 'Avg. order value', value: '$65.60', delta: 3.8, spark: [5, 5, 6, 6, 7, 6, 7] },
  ]);

  revenueByDay = signal<BarDatum[]>([
    { label: 'Mon', value: 32 },
    { label: 'Tue', value: 41 },
    { label: 'Wed', value: 38 },
    { label: 'Thu', value: 52 },
    { label: 'Fri', value: 61 },
    { label: 'Sat', value: 44 },
    { label: 'Sun', value: 29 },
  ]);

  recentOrders = signal<Order[]>([
    { id: '#3021', customer: 'Priya Natarajan', date: '2026-07-14', amount: 214.0, status: 'paid' },
    { id: '#3020', customer: 'Elena Farkas', date: '2026-07-14', amount: 58.5, status: 'pending' },
    { id: '#3019', customer: 'Marcus Boyd', date: '2026-07-13', amount: 132.2, status: 'paid' },
    { id: '#3018', customer: 'Yuki Tanaka', date: '2026-07-13', amount: 76.0, status: 'refunded' },
    { id: '#3017', customer: 'Sofia Reyes', date: '2026-07-12', amount: 310.75, status: 'paid' },
    { id: '#3016', customer: 'Daniel Osei', date: '2026-07-12', amount: 44.9, status: 'failed' },
  ]);

  activity = signal<ActivityItem[]>([
    { id: '1', actor: 'Priya Natarajan', action: 'placed order #3021', time: '4m ago' },
    {
      id: '2',
      actor: 'System',
      action: 'flagged order #3016 for a failed charge',
      time: '38m ago',
    },
    { id: '3', actor: 'Marcus Boyd', action: 'updated shipping address', time: '1h ago' },
    { id: '4', actor: 'Elena Farkas', action: 'requested a refund on #3009', time: '3h ago' },
  ]);
}
