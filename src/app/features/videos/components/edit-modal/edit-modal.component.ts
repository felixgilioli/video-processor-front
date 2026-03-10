import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Video } from '../../../../core/models/video.model';
import { VideoService } from '../../../../core/services/video.service';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="closed.emit()"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg animate-slide-up">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">Editar Vídeo</h2>
          <button (click)="closed.emit()"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" class="px-6 py-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Título <span class="text-red-500">*</span>
            </label>
            <input formControlName="title" type="text"
              class="input-field"
              [class.border-red-400]="form.get('title')?.invalid && form.get('title')?.touched" />
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <p class="mt-1 text-xs text-red-500">Título é obrigatório</p>
            }
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
            <textarea formControlName="description" rows="3"
              class="input-field resize-none"></textarea>
          </div>

          @if (error()) {
            <div class="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
              </svg>
              {{ error() }}
            </div>
          }
        </form>

        <!-- Footer -->
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button class="btn-secondary" (click)="closed.emit()" [disabled]="saving()">Cancelar</button>
          <button class="btn-primary" (click)="onSave()" [disabled]="saving()">
            @if (saving()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Salvando...
            } @else {
              Salvar
            }
          </button>
        </div>
      </div>
    </div>
  `,
})
export class EditModalComponent implements OnInit {
  @Input({ required: true }) video!: Video;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private readonly videoService = inject(VideoService);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
  });

  saving = signal(false);
  error = signal('');

  ngOnInit() {
    this.form.patchValue({
      title: this.video.title,
      description: this.video.description,
    });
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');

    this.videoService.update(this.video.id, {
      title: this.form.value.title!,
      description: this.form.value.description || '',
    }).subscribe({
      next: () => this.saved.emit(),
      error: () => {
        this.error.set('Erro ao salvar. Tente novamente.');
        this.saving.set(false);
      },
    });
  }
}
