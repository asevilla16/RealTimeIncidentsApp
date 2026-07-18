/**
 * Seeds Firebase Auth users, Firestore profiles, incidents, and incident
 * updates for local development.
 *
 * Run with: npm run seed
 * (uses the same FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 * env vars as the app itself - see .env.example)
 *
 * Idempotent-ish: re-running will error on duplicate emails for users (Admin
 * SDK createUser rejects existing emails) - catch-and-skip handles that so
 * you can safely re-run to reset incidents/updates without recreating users.
 */
import 'dotenv/config';
import { getAdminApp } from '../src/app/core/firebase/firebase-admin.server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const app = getAdminApp();

const auth = getAuth(app);
const db = getFirestore(app);

// --- Users -------------------------------------------------------------

const USERS = [
  { email: 'alex@example.com', password: 'password123', name: 'Alex Rivera' },
  { email: 'jordan@example.com', password: 'password123', name: 'Jordan Blake' },
  { email: 'sam@example.com', password: 'password123', name: 'Sam Okafor' },
  { email: 'priya@example.com', password: 'password123', name: 'Priya Nair' },
] as const;

async function seedUsers(): Promise<Record<string, string>> {
  const emailToUid: Record<string, string> = {};

  for (const u of USERS) {
    try {
      const created = await auth.createUser({
        email: u.email,
        password: u.password,
        displayName: u.name,
      });
      emailToUid[u.email] = created.uid;
      console.log(`Created user ${u.email} (${created.uid})`);
    } catch (err: any) {
      if (err.code === 'auth/email-already-exists') {
        const existing = await auth.getUserByEmail(u.email);
        emailToUid[u.email] = existing.uid;
        console.log(`User ${u.email} already exists, reusing (${existing.uid})`);
      } else {
        throw err;
      }
    }

    await db
      .collection('profiles')
      .doc(emailToUid[u.email]!)
      .set({ name: u.name, avatarUrl: null }, { merge: true });
  }

  return emailToUid;
}

// --- Incidents + updates -------------------------------------------------

function hoursAgo(h: number): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() - h * 60 * 60 * 1000));
}

interface SeedIncident {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  ownerEmail: (typeof USERS)[number]['email'];
  createdHoursAgo: number;
  updatedHoursAgo: number;
  resolvedHoursAgo?: number;
  updates: { authorEmail: (typeof USERS)[number]['email']; message: string; hoursAgo: number }[];
}

const INCIDENTS: SeedIncident[] = [
  {
    title: 'Payment API returning elevated 500s',
    description: 'Checkout service failing intermittently for EU customers since ~14:00 UTC.',
    severity: 'critical',
    status: 'investigating',
    ownerEmail: 'alex@example.com',
    createdHoursAgo: 2,
    updatedHoursAgo: 0.2,
    updates: [
      {
        authorEmail: 'alex@example.com',
        message: 'Paging on-call, error rate at 18%.',
        hoursAgo: 2,
      },
      {
        authorEmail: 'jordan@example.com',
        message: 'Confirmed: correlates with payments-db connection pool exhaustion.',
        hoursAgo: 1,
      },
      {
        authorEmail: 'alex@example.com',
        message: 'Scaling connection pool as a mitigation while we find root cause.',
        hoursAgo: 0.2,
      },
    ],
  },
  {
    title: 'Search service p99 latency spike',
    description: 'Search results taking 4-6s during peak traffic, previously ~400ms.',
    severity: 'high',
    status: 'identified',
    ownerEmail: 'sam@example.com',
    createdHoursAgo: 6,
    updatedHoursAgo: 1.5,
    updates: [
      {
        authorEmail: 'sam@example.com',
        message: 'Latency dashboards show p99 climbing since the 09:00 deploy.',
        hoursAgo: 6,
      },
      {
        authorEmail: 'priya@example.com',
        message: 'Bisected to the new relevance-scoring change; rollback candidate identified.',
        hoursAgo: 1.5,
      },
    ],
  },
  {
    title: 'Suspicious login attempts from new IP range',
    description:
      'Auth logs show a burst of failed logins against admin accounts from a single /24.',
    severity: 'high',
    status: 'monitoring',
    ownerEmail: 'priya@example.com',
    createdHoursAgo: 20,
    updatedHoursAgo: 4,
    updates: [
      {
        authorEmail: 'priya@example.com',
        message: 'Blocked the IP range at the edge, no successful auths observed.',
        hoursAgo: 20,
      },
      {
        authorEmail: 'priya@example.com',
        message: 'Monitoring for 24h before closing out.',
        hoursAgo: 4,
      },
    ],
  },
  {
    title: 'CI/CD pipeline failing for main branch',
    description: 'Deploy pipeline red for all merges to main since last runner image update.',
    severity: 'medium',
    status: 'investigating',
    ownerEmail: 'jordan@example.com',
    createdHoursAgo: 3,
    updatedHoursAgo: 0.5,
    updates: [
      {
        authorEmail: 'jordan@example.com',
        message: 'Runner image bump broke the cache step, looking into a pin.',
        hoursAgo: 3,
      },
    ],
  },
  {
    title: 'Third-party email provider intermittent outage',
    description: 'Transactional emails (password resets, receipts) delayed up to 30 minutes.',
    severity: 'medium',
    status: 'monitoring',
    ownerEmail: 'alex@example.com',
    createdHoursAgo: 10,
    updatedHoursAgo: 3,
    updates: [
      {
        authorEmail: 'alex@example.com',
        message: 'Provider status page confirms a regional outage, no action on our side yet.',
        hoursAgo: 10,
      },
      {
        authorEmail: 'alex@example.com',
        message: 'Provider reports partial recovery, watching delivery lag.',
        hoursAgo: 3,
      },
    ],
  },
  {
    title: 'Stale cache serving outdated pricing',
    description:
      'A subset of users saw last week\u2019s pricing for ~40 minutes after a catalog update.',
    severity: 'low',
    status: 'resolved',
    ownerEmail: 'sam@example.com',
    createdHoursAgo: 30,
    updatedHoursAgo: 28,
    resolvedHoursAgo: 28,
    updates: [
      {
        authorEmail: 'sam@example.com',
        message: 'Identified: CDN cache TTL misconfigured after the catalog service redeploy.',
        hoursAgo: 30,
      },
      {
        authorEmail: 'sam@example.com',
        message: 'Purged CDN cache and corrected TTL; pricing confirmed accurate.',
        hoursAgo: 28,
      },
    ],
  },
  {
    title: 'Notification service dropped messages during deploy',
    description:
      'Push notifications for ~5 minutes during the 11:00 rolling deploy were not delivered.',
    severity: 'low',
    status: 'resolved',
    ownerEmail: 'priya@example.com',
    createdHoursAgo: 50,
    updatedHoursAgo: 49,
    resolvedHoursAgo: 49,
    updates: [
      {
        authorEmail: 'priya@example.com',
        message: 'Confirmed as a brief gap during rolling restart, not retried by design.',
        hoursAgo: 50,
      },
      {
        authorEmail: 'priya@example.com',
        message: 'Added a drain step to the deploy to prevent recurrence; closing out.',
        hoursAgo: 49,
      },
    ],
  },
  {
    title: 'Warehouse ETL job failed nightly run',
    description: 'Analytics warehouse sync did not complete; dashboards showing stale data.',
    severity: 'medium',
    status: 'resolved',
    ownerEmail: 'jordan@example.com',
    createdHoursAgo: 75,
    updatedHoursAgo: 72,
    resolvedHoursAgo: 72,
    updates: [
      {
        authorEmail: 'jordan@example.com',
        message: 'Job failed on a schema drift in the orders table.',
        hoursAgo: 75,
      },
      {
        authorEmail: 'jordan@example.com',
        message: 'Patched the transform and re-ran manually; nightly job green again.',
        hoursAgo: 72,
      },
    ],
  },
];

async function seedIncidents(
  emailToUid: Record<string, string>,
  nameByEmail: Record<string, string>,
) {
  for (const incident of INCIDENTS) {
    const ref = db.collection('incidents').doc();

    await ref.set({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      ownerId: emailToUid[incident.ownerEmail],
      ownerName: nameByEmail[incident.ownerEmail],
      createdAt: hoursAgo(incident.createdHoursAgo),
      updatedAt: hoursAgo(incident.updatedHoursAgo),
      resolvedAt:
        incident.resolvedHoursAgo !== undefined ? hoursAgo(incident.resolvedHoursAgo) : null,
    });

    for (const update of incident.updates) {
      await ref.collection('updates').add({
        authorId: emailToUid[update.authorEmail],
        authorName: nameByEmail[update.authorEmail],
        message: update.message,
        createdAt: hoursAgo(update.hoursAgo),
      });
    }

    console.log(`Created incident "${incident.title}" with ${incident.updates.length} update(s)`);
  }
}

async function main() {
  const emailToUid = await seedUsers();
  const nameByEmail = Object.fromEntries(USERS.map((u) => [u.email, u.name]));
  await seedIncidents(emailToUid, nameByEmail);
  console.log('\nSeed complete. Test login: alex@example.com / password123');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
