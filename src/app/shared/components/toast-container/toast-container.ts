import { Component, inject } from '@angular/core';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.html',
})
export class ToastContainer {
  private readonly toastService = inject(Toast);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
