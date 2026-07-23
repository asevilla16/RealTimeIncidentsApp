export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  authorName: string;
  message: string;
  createdAt: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  ownerName: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  updates: IncidentUpdate[];
}
