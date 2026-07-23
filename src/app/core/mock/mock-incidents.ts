import { Incident, IncidentSeverity, IncidentUpdate } from '../models/incident.model';

// Mirrors the Firestore `incidents` / `incidents/{id}/updates` shape seeded by
// scripts/seed.ts, so swapping this for a Firestore-backed service later is a
// drop-in replacement rather than a rewrite.
export function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

export let updateSeq = 0;
export function seedUpdate(
  incidentId: string,
  authorName: string,
  message: string,
  hoursAgoValue: number,
): IncidentUpdate {
  return {
    id: `u${++updateSeq}`,
    incidentId,
    authorName,
    message,
    createdAt: hoursAgo(hoursAgoValue),
  };
}

export const SEVERITY_ORDER: IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];

export const OWNER_IDS: Record<string, string> = {
  'Alex Rivera': 'user-alex',
  'Jordan Blake': 'user-jordan',
  'Sam Okafor': 'user-sam',
  'Priya Nair': 'user-priya',
};

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Payment API returning elevated 500s',
    description: 'Checkout service failing intermittently for EU customers since ~14:00 UTC.',
    severity: 'critical',
    status: 'investigating',
    ownerName: 'Alex Rivera',
    ownerId: OWNER_IDS['Alex Rivera'],
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(0.2),
    resolvedAt: null,
    updates: [
      seedUpdate('inc-1', 'Alex Rivera', 'Paging on-call, error rate at 18%.', 2),
      seedUpdate(
        'inc-1',
        'Jordan Blake',
        'Confirmed: correlates with payments-db connection pool exhaustion.',
        1,
      ),
      seedUpdate(
        'inc-1',
        'Alex Rivera',
        'Scaling connection pool as a mitigation while we find root cause.',
        0.2,
      ),
    ],
  },
  {
    id: 'inc-2',
    title: 'Search service p99 latency spike',
    description: 'Search results taking 4-6s during peak traffic, previously ~400ms.',
    severity: 'high',
    status: 'identified',
    ownerName: 'Sam Okafor',
    ownerId: OWNER_IDS['Sam Okafor'],
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(1.5),
    resolvedAt: null,
    updates: [
      seedUpdate(
        'inc-2',
        'Sam Okafor',
        'Latency dashboards show p99 climbing since the 09:00 deploy.',
        6,
      ),
      seedUpdate(
        'inc-2',
        'Priya Nair',
        'Bisected to the new relevance-scoring change; rollback candidate identified.',
        1.5,
      ),
    ],
  },
  {
    id: 'inc-3',
    title: 'Suspicious login attempts from new IP range',
    description:
      'Auth logs show a burst of failed logins against admin accounts from a single /24.',
    severity: 'high',
    status: 'monitoring',
    ownerName: 'Priya Nair',
    ownerId: OWNER_IDS['Priya Nair'],
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(4),
    resolvedAt: null,
    updates: [
      seedUpdate(
        'inc-3',
        'Priya Nair',
        'Blocked the IP range at the edge, no successful auths observed.',
        20,
      ),
      seedUpdate('inc-3', 'Priya Nair', 'Monitoring for 24h before closing out.', 4),
    ],
  },
  {
    id: 'inc-4',
    title: 'CI/CD pipeline failing for main branch',
    description: 'Deploy pipeline red for all merges to main since last runner image update.',
    severity: 'medium',
    status: 'investigating',
    ownerName: 'Jordan Blake',
    ownerId: OWNER_IDS['Jordan Blake'],
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(0.5),
    resolvedAt: null,
    updates: [
      seedUpdate(
        'inc-4',
        'Jordan Blake',
        'Runner image bump broke the cache step, looking into a pin.',
        3,
      ),
    ],
  },
  {
    id: 'inc-5',
    title: 'Third-party email provider intermittent outage',
    description: 'Transactional emails (password resets, receipts) delayed up to 30 minutes.',
    severity: 'medium',
    status: 'monitoring',
    ownerName: 'Alex Rivera',
    ownerId: OWNER_IDS['Alex Rivera'],
    createdAt: hoursAgo(10),
    updatedAt: hoursAgo(3),
    resolvedAt: null,
    updates: [
      seedUpdate(
        'inc-5',
        'Alex Rivera',
        'Provider status page confirms a regional outage, no action on our side yet.',
        10,
      ),
      seedUpdate(
        'inc-5',
        'Alex Rivera',
        'Provider reports partial recovery, watching delivery lag.',
        3,
      ),
    ],
  },
  {
    id: 'inc-6',
    title: 'Stale cache serving outdated pricing',
    description:
      'A subset of users saw last week’s pricing for ~40 minutes after a catalog update.',
    severity: 'low',
    status: 'resolved',
    ownerName: 'Sam Okafor',
    ownerId: OWNER_IDS['Sam Okafor'],
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(28),
    resolvedAt: hoursAgo(28),
    updates: [
      seedUpdate(
        'inc-6',
        'Sam Okafor',
        'Identified: CDN cache TTL misconfigured after the catalog service redeploy.',
        30,
      ),
      seedUpdate(
        'inc-6',
        'Sam Okafor',
        'Purged CDN cache and corrected TTL; pricing confirmed accurate.',
        28,
      ),
    ],
  },
  {
    id: 'inc-7',
    title: 'Notification service dropped messages during deploy',
    description:
      'Push notifications for ~5 minutes during the 11:00 rolling deploy were not delivered.',
    severity: 'low',
    status: 'resolved',
    ownerName: 'Priya Nair',
    ownerId: OWNER_IDS['Priya Nair'],
    createdAt: hoursAgo(50),
    updatedAt: hoursAgo(49),
    resolvedAt: hoursAgo(49),
    updates: [
      seedUpdate(
        'inc-7',
        'Priya Nair',
        'Confirmed as a brief gap during rolling restart, not retried by design.',
        50,
      ),
      seedUpdate(
        'inc-7',
        'Priya Nair',
        'Added a drain step to the deploy to prevent recurrence; closing out.',
        49,
      ),
    ],
  },
  {
    id: 'inc-8',
    title: 'Warehouse ETL job failed nightly run',
    description: 'Analytics warehouse sync did not complete; dashboards showing stale data.',
    severity: 'medium',
    status: 'resolved',
    ownerName: 'Jordan Blake',
    ownerId: OWNER_IDS['Jordan Blake'],
    createdAt: hoursAgo(75),
    updatedAt: hoursAgo(72),
    resolvedAt: hoursAgo(72),
    updates: [
      seedUpdate('inc-8', 'Jordan Blake', 'Job failed on a schema drift in the orders table.', 75),
      seedUpdate(
        'inc-8',
        'Jordan Blake',
        'Patched the transform and re-ran manually; nightly job green again.',
        72,
      ),
    ],
  },
];
