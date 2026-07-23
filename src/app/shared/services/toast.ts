import { Service, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

const DEFAULT_DURATION_MS = 4000;

@Service()
export class Toast {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  private show(message: string, variant: ToastVariant): void {
    const id = ++this.nextId;
    this._toasts.update((list) => [...list, { id, message, variant }]);
    setTimeout(() => this.dismiss(id), DEFAULT_DURATION_MS);
  }
}
