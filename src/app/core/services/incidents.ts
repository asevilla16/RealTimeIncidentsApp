import {
  afterNextRender,
  computed,
  DestroyRef,
  inject,
  PLATFORM_ID,
  Service,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { getClientDb } from '../firebase/firebase-client';
import { BarDatum } from '../../shared/components/bar-chart/bar-chart.component';
import { Incident, IncidentSeverity, IncidentUpdate } from '../models/incident.model';
import { SEVERITY_ORDER } from '../mock/mock-incidents';

// Same severity -> hue mapping as SeverityPillComponent, solid instead of tinted.
const SEVERITY_CHART_COLORS: Record<IncidentSeverity, string> = {
  critical: 'bg-coral',
  high: 'bg-amber-dark',
  medium: 'bg-amber',
  low: 'bg-teal',
};

@Service()
export class Incidents {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  // Empty until the first Firestore snapshot arrives; isLoading distinguishes
  // "still loading" from "genuinely no incidents" for consumers.
  private readonly _incidents = signal<Incident[]>([]);

  private readonly _isLoading = signal(true);
  readonly isLoading = this._isLoading.asReadonly();

  // Populated by subscribeToRecentUpdates() - raw update docs, not yet
  // joined with their parent incident (see recentUpdates below).
  private readonly _recentUpdateDocs = signal<IncidentUpdate[]>([]);

  readonly incidents = computed(() =>
    [...this._incidents()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
  );

  readonly activeIncidents = computed(() =>
    this.incidents().filter((i) => i.status !== 'resolved'),
  );

  readonly criticalCount = computed(
    () => this.activeIncidents().filter((i) => i.severity === 'critical').length,
  );

  readonly investigatingCount = computed(
    () => this.incidents().filter((i) => i.status === 'investigating').length,
  );

  readonly resolvedThisWeek = computed(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return this.incidents().filter(
      (i) => i.status === 'resolved' && i.resolvedAt !== null && i.resolvedAt.getTime() >= weekAgo,
    ).length;
  });

  readonly severityBreakdown = computed<BarDatum[]>(() =>
    SEVERITY_ORDER.map((severity) => ({
      label: severity[0].toUpperCase() + severity.slice(1),
      value: this.incidents().filter((i) => i.severity === severity).length,
      colorClass: SEVERITY_CHART_COLORS[severity],
    })),
  );

  // Joins the raw update docs from subscribeToRecentUpdates() with their
  // parent incident (for title/id) so consumers get a ready-to-render
  // { incident, ...update } entry. Entries whose incident hasn't loaded yet
  // (main list listener lags the collection-group one) are dropped rather
  // than shown with missing incident info.
  readonly recentUpdates = computed(() => {
    const incidentsById = new Map(this.incidents().map((incident) => [incident.id, incident]));

    return this._recentUpdateDocs()
      .map((update) => {
        const incident = incidentsById.get(update.incidentId);
        return incident ? { incident, ...update } : null;
      })
      .filter((entry): entry is { incident: Incident } & IncidentUpdate => entry !== null);
  });

  constructor() {
    // afterNextRender + isPlatformBrowser: getClientDb() touches browser-only
    // APIs and must never run during SSR - see firebase-client.ts.
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.getIncidentsFromFirebase();
        this.getMoreRecentUpdates();
      });
    }
  }

  private getIncidentsFromFirebase(): void {
    const incidentsQuery = query(
      collection(getClientDb(), 'incidents'),
      orderBy('updatedAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      incidentsQuery,
      (snapshot) => {
        this._incidents.set(
          snapshot.docs.map((doc) => {
            const data = doc.data();
            const resolvedAt = data['resolvedAt'] as Timestamp | null;

            return {
              id: doc.id,
              title: data['title'] ?? '',
              description: data['description'] ?? '',
              severity: data['severity'],
              status: data['status'],
              ownerId: data['ownerId'] ?? '',
              ownerName: data['ownerName'] ?? '',
              createdAt: (data['createdAt'] as Timestamp | undefined)?.toDate() ?? new Date(0),
              updatedAt: (data['updatedAt'] as Timestamp | undefined)?.toDate() ?? new Date(0),
              resolvedAt: resolvedAt ? resolvedAt.toDate() : null,
              // List view doesn't render activity history, so updates aren't
              // fetched here - the incident-detail page loads its own.
              updates: [],
            } satisfies Incident;
          }),
        );
        this._isLoading.set(false);
      },
      (error) => {
        console.error('Failed to load incidents from Firestore:', error);
        this._isLoading.set(false);
      },
    );

    this.destroyRef.onDestroy(unsubscribe);
  }

  // Dedicated listener for the dashboard's "recent updates" panel - a
  // collection-group query across every incident's `updates` subcollection,
  // most recent first. Separate from watchIncidentUpdates() because that one
  // is scoped to a single incident and started on demand by the detail page,
  // while this one is app-wide and always-on.
  //
  // Deliberately no server-side orderBy/limit: a collection-group query with
  // orderBy requires a Firestore index explicitly scoped to "Collection
  // group" (not created automatically, unlike single-collection queries),
  // and this app has no infra step to provision one. Sorting/limiting
  // client-side instead trades a bit of extra read volume for zero required
  // Firestore console setup.
  private getMoreRecentUpdates(): void {
    const recentUpdatesQuery = query(collectionGroup(getClientDb(), 'updates'));

    const unsubscribe = onSnapshot(
      recentUpdatesQuery,
      (snapshot) => {
        this._recentUpdateDocs.set(
          snapshot.docs
            .map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                // Collection-group docs don't carry their parent id directly -
                // recover it from the doc's own path (.../incidents/{id}/updates/{id}).
                incidentId: docSnap.ref.parent.parent?.id ?? '',
                authorName: data['authorName'] ?? '',
                message: data['message'] ?? '',
                createdAt: (data['createdAt'] as Timestamp | undefined)?.toDate() ?? new Date(0),
              } satisfies IncidentUpdate;
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 6),
        );
      },
      (error) => console.error('Failed to load recent updates from Firestore:', error),
    );

    this.destroyRef.onDestroy(unsubscribe);
  }

  byId(id: string) {
    return computed(() => this._incidents().find((incident) => incident.id === id));
  }

  // Live-subscribes to an incident's `updates` subcollection. Kept separate
  // from the main incidents listener since the list view never needs
  // activity history - only the detail page does. Returns the unsubscribe
  // function; callers are responsible for calling it when done (e.g. from
  // an effect's cleanup, or DestroyRef.onDestroy).
  watchIncidentUpdates(
    incidentId: string,
    onChange: (updates: IncidentUpdate[]) => void,
  ): () => void {
    const updatesQuery = query(
      collection(getClientDb(), 'incidents', incidentId, 'updates'),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(
      updatesQuery,
      (snapshot) => {
        onChange(
          snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              incidentId,
              authorName: data['authorName'] ?? '',
              message: data['message'] ?? '',
              createdAt: (data['createdAt'] as Timestamp | undefined)?.toDate() ?? new Date(0),
            } satisfies IncidentUpdate;
          }),
        );
      },
      (error) => console.error('Failed to load incident updates from Firestore:', error),
    );
  }

  async addUpdate(incidentId: string, authorName: string, message: string): Promise<void> {
    const trimmed = message.trim();
    if (!trimmed) return;

    await addDoc(collection(getClientDb(), 'incidents', incidentId, 'updates'), {
      authorName,
      message: trimmed,
      createdAt: serverTimestamp(),
    });

    // Bumps the parent so the incidents list re-sorts to surface this
    // incident, mirroring what a real-time "recently active" view expects.
    await updateDoc(doc(getClientDb(), 'incidents', incidentId), { updatedAt: serverTimestamp() });
  }
}
