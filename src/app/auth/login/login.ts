import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(Auth);

  readonly isPending = this.auth.isPending;
  readonly error = this.auth.error;

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  async login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    const success = await this.auth.signIn(email, password);
    if (!success) return;

    const next = this.route.snapshot.queryParamMap.get('next') ?? '/';
    this.router.navigateByUrl(next);
  }

  async loginWithGoogle() {
    const success = await this.auth.signInWithGoogle();
    if (!success) return;
    const next = this.route.snapshot.queryParamMap.get('next') ?? '/';
    this.router.navigateByUrl(next);
  }
}
