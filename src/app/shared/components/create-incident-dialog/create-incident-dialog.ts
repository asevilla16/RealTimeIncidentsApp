import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Incidents } from '../../../core/services/incidents';
import { Auth } from '../../../auth/services/auth';
import { Incident, IncidentSeverity, IncidentStatus } from '../../../core/models/incident.model';
import { Toast } from '../../services/toast';

const SEVERITIES: IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: IncidentStatus[] = ['investigating', 'identified', 'monitoring', 'resolved'];

@Component({
  selector: 'app-create-incident-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './create-incident-dialog.html',
})
export class CreateIncidentDialog {
  private readonly incidentsService = inject(Incidents);
  private readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(Toast);

  open = input(false);
  incident = input<Incident | null>(null);
  closed = output<void>();

  readonly severities = SEVERITIES;
  readonly statuses = STATUSES;

  readonly isEditMode = computed(() => this.incident() !== null);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    severity: 'medium' as IncidentSeverity,
    status: 'investigating' as IncidentStatus,
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;

      this.error.set(null);
      const incident = this.incident();

      this.form.reset(
        incident
          ? {
              title: incident.title,
              description: incident.description,
              severity: incident.severity,
              status: incident.status,
            }
          : {
              title: '',
              description: '',
              severity: 'medium',
              status: 'investigating',
            },
      );
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, severity, status } = this.form.getRawValue();
    const payload = {
      title: title.trim(),
      description: description.trim(),
      severity,
      status,
    };
    const incident = this.incident();

    this.isSubmitting.set(true);
    this.error.set(null);
    try {
      if (incident) {
        await this.incidentsService.updateIncident(incident.id, payload);
        this.toast.success(`Incident "${payload.title}" updated.`);
      } else {
        const user = this.auth.user();
        await this.incidentsService.createIncident({
          ...payload,
          ownerId: user?.uid ?? '',
          ownerName: user?.name || 'Unknown',
        });
        this.toast.success(`Incident "${payload.title}" created.`);
      }
      this.closed.emit();
    } catch (err) {
      console.error(`Failed to ${incident ? 'update' : 'create'} incident:`, err);
      this.error.set(
        `Something went wrong ${incident ? 'saving' : 'creating'} the incident. Try again.`,
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
