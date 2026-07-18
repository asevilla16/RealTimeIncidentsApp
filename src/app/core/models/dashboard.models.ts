export interface StatCard {
  label: string;
  value: string;
  delta: number; // positive or negative percent
  spark: number[]; // small trend series
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  time: string;
}
