import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { VideoService } from '../../../../core/services/video.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="onClose()"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg animate-slide-up">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">Upload de Vídeo</h2>
          <button (click)="onClose()"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-5 space-y-4">

          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Título <span class="text-red-500">*</span>
            </label>
            <input formControlName="title" type="text" placeholder="Nome do vídeo"
              class="input-field"
              [class.border-red-400]="form.get('title')?.invalid && form.get('title')?.touched" />
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <p class="mt-1 text-xs text-red-500">Título é obrigatório</p>
            }
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
            <textarea formControlName="description" rows="2" placeholder="Descrição opcional"
              class="input-field resize-none"></textarea>
          </div>

          <!-- File Drop Zone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Arquivo de vídeo <span class="text-red-500">*</span>
            </label>
            <div
              class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
              [class.border-sky-400]="isDragging()"
              [class.bg-sky-50]="isDragging()"
              [class.border-gray-300]="!isDragging()"
              [class.hover:border-gray-400]="!isDragging()"
              (dragover)="onDragOver($event)"
              (dragleave)="isDragging.set(false)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()">
              @if (selectedFile()) {
                <div class="flex items-center justify-center gap-3">
                  <svg class="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                  </svg>
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">{{ selectedFile()!.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatSize(selectedFile()!.size) }}</p>
                  </div>
                </div>
              } @else {
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-700">Arraste e solte ou clique para selecionar</p>
                    <p class="text-xs text-gray-400 mt-0.5">MP4, MOV, AVI, MKV (máx. 2GB)</p>
                  </div>
                </div>
              }
              <input #fileInput type="file" accept="video/*" class="hidden" (change)="onFileChange($event)">
            </div>
            @if (fileError()) {
              <p class="mt-1 text-xs text-red-500">{{ fileError() }}</p>
            }
          </div>

          <!-- Progress -->
          @if (isUploading()) {
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs text-gray-600">
                <span>{{ uploadStep() }}</span>
                <span>{{ progress() }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div class="h-full bg-sky-500 rounded-full transition-all duration-300"
                  [style.width.%]="progress()"></div>
              </div>
            </div>
          }

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
          <button type="button" class="btn-secondary" (click)="onClose()" [disabled]="isUploading()">
            Cancelar
          </button>
          <button type="button" class="btn-primary" (click)="onSubmit()"
            [disabled]="isUploading() || !selectedFile()">
            @if (isUploading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Enviando...
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              Enviar
            }
          </button>
        </div>
      </div>
    </div>
  `,
})
export class UploadModalComponent {
  @Output() uploaded = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private readonly videoService = inject(VideoService);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
  });

  isDragging = signal(false);
  selectedFile = signal<File | null>(null);
  fileError = signal('');
  isUploading = signal(false);
  progress = signal(0);
  uploadStep = signal('');
  error = signal('');

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File) {
    if (!file.type.startsWith('video/')) {
      this.fileError.set('Selecione um arquivo de vídeo válido');
      return;
    }
    this.fileError.set('');
    this.selectedFile.set(file);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedFile()) {
      this.fileError.set('Selecione um arquivo de vídeo');
      return;
    }

    this.isUploading.set(true);
    this.error.set('');

    try {
      this.uploadStep.set('Criando registro...');
      this.progress.set(10);

      const video = await new Promise<{ id: string }>((resolve, reject) => {
        this.videoService.create({
          title: this.form.value.title!,
          description: this.form.value.description || '',
        }).subscribe({ next: resolve, error: reject });
      });

      this.uploadStep.set('Enviando arquivo...');
      this.progress.set(30);

      await new Promise<void>((resolve, reject) => {
        this.videoService.upload(video.id, this.selectedFile()!).subscribe({
          next: () => { this.progress.set(100); resolve(); },
          error: reject,
        });
      });

      this.uploaded.emit();
    } catch {
      this.error.set('Ocorreu um erro durante o upload. Tente novamente.');
      this.isUploading.set(false);
    }
  }

  onClose() {
    if (!this.isUploading()) this.closed.emit();
  }
}
