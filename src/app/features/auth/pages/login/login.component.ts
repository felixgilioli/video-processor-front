import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div class="h-1.5 bg-gradient-to-r from-sky-500 to-blue-600"></div>

          <div class="px-8 py-10">

            <!-- Logo -->
            <div class="flex flex-col items-center mb-8">
              <div class="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center mb-4 shadow-lg shadow-sky-200">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">VideoProcessor</h1>
              <p class="text-sm text-gray-500 mt-1">Entre na sua conta para continuar</p>
            </div>

            <!-- Form -->
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

              <!-- Email/Username -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  E-mail
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                    </svg>
                  </span>
                  <input
                    formControlName="username"
                    type="text"
                    placeholder="usuario@exemplo.com"
                    autocomplete="username"
                    class="input-field pl-9"
                    [class.border-red-400]="form.get('username')?.invalid && form.get('username')?.touched" />
                </div>
                @if (form.get('username')?.invalid && form.get('username')?.touched) {
                  <p class="mt-1 text-xs text-red-500">Informe seu e-mail ou usuário</p>
                }
              </div>

              <!-- Password -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Senha
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </span>
                  <input
                    formControlName="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    class="input-field pl-9 pr-10"
                    [class.border-red-400]="form.get('password')?.invalid && form.get('password')?.touched" />
                  <button type="button"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    (click)="showPassword.set(!showPassword())">
                    @if (showPassword()) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (form.get('password')?.invalid && form.get('password')?.touched) {
                  <p class="mt-1 text-xs text-red-500">Informe sua senha</p>
                }
              </div>

              <!-- Error message -->
              @if (errorMsg()) {
                <div class="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in">
                  <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                  </svg>
                  {{ errorMsg() }}
                </div>
              }

              <!-- Submit -->
              <button
                type="submit"
                class="w-full btn-primary py-2.5 mt-2 text-base"
                [disabled]="loading()">
                @if (loading()) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Entrando...
                } @else {
                  Entrar
                }
              </button>
            </form>
          </div>

          <!-- Footer -->
          <div class="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <svg class="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Autenticação via Keycloak &mdash; VideoProcessor &copy; {{ year }}
            </div>
          </div>
        </div>

        <!-- Dev hint -->
        <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p class="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
            </svg>
            Credenciais de teste
          </p>
          <div class="space-y-1 text-xs text-amber-600 font-mono">
            <button type="button" class="block hover:text-amber-800 transition-colors text-left w-full"
              (click)="fillCredentials('admin@fiapx.com', 'admin123')">
              admin&#64;fiapx.com / admin123
            </button>
            <button type="button" class="block hover:text-amber-800 transition-colors text-left w-full"
              (click)="fillCredentials('user@fiapx.com', 'user123')">
              user&#64;fiapx.com / user123
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  year = new Date().getFullYear();
  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  fillCredentials(username: string, password: string) {
    this.form.patchValue({ username, password });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const { username, password } = this.form.value;

    this.auth.login(username!, password!).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: Error) => {
        this.errorMsg.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
