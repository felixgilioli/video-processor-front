import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { Video } from '../../../../core/models/video.model';
import { VideoService } from '../../../../core/services/video.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, StatusBadgeComponent, EditModalComponent, ConfirmDialogComponent],
  template: `
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-gray-900 dark:text-white">VideoProcessor</span>
          </div>

          <!-- Theme toggle -->
          <button (click)="theme.toggle()"
            [title]="theme.isDark() ? 'Modo claro' : 'Modo escuro'"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            @if (theme.isDark()) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            }
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Back -->
      <a routerLink="/"
        class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Voltar para Dashboard
      </a>

      <!-- Loading -->
      @if (loading()) {
        <div class="space-y-6">
          <div class="skeleton h-8 w-64 rounded-lg"></div>
          <div class="skeleton aspect-video w-full rounded-xl"></div>
          <div class="space-y-2">
            <div class="skeleton h-4 w-full rounded"></div>
            <div class="skeleton h-4 w-2/3 rounded"></div>
          </div>
        </div>
      }

      <!-- Error -->
      @if (error() && !loading()) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Vídeo não encontrado</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ error() }}</p>
          <a routerLink="/" class="btn-secondary">Voltar ao Dashboard</a>
        </div>
      }

      <!-- Video content -->
      @if (video() && !loading()) {
        <div class="space-y-6 animate-fade-in">

          <!-- Title + actions -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ video()!.title }}</h1>
                <app-status-badge [status]="video()!.status" />
              </div>
              @if (video()!.description) {
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ video()!.description }}</p>
              }
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button class="btn-secondary" (click)="editingVideo.set(video()!)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
              </button>
              <button class="btn-danger" (click)="showDeleteConfirm.set(true)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Excluir
              </button>
            </div>
          </div>

          <!-- Video Player -->
          @if (video()!.videoUrl) {
            <div class="card overflow-hidden">
              <video class="w-full aspect-video bg-black" controls [src]="video()!.videoUrl">
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
            <p class="text-xs text-gray-400 dark:text-gray-500 -mt-2">
              Criado em {{ video()!.createdAt | date: 'dd/MM/yyyy HH:mm' }}
            </p>
          }

          <!-- Processing state -->
          @if (video()!.status === 'PROCESSING' && !video()!.videoUrl) {
            <div class="card p-8 flex flex-col items-center justify-center text-center">
              <div class="flex gap-1.5 mb-4">
                <div class="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
                <div class="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Processando vídeo...</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Isso pode levar alguns minutos. A página será atualizada automaticamente.</p>
            </div>
          }

          <!-- Pending state -->
          @if (video()!.status === 'PENDING' && !video()!.videoUrl) {
            <div class="card p-8 flex flex-col items-center justify-center text-center">
              <div class="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Aguardando processamento</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">O vídeo está na fila de processamento.</p>
            </div>
          }

          <!-- Failed state -->
          @if (video()!.status === 'FAILED') {
            <div class="card p-8 flex flex-col items-center justify-center text-center">
              <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Falha no processamento</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Ocorreu um erro durante o processamento deste vídeo.</p>
            </div>
          }

          <!-- Frames grid -->
          @if (video()!.frames && video()!.frames!.length > 0) {
            <div>
              <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Frames Extraídos
                <span class="text-xs font-normal text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {{ video()!.frames!.length }}
                </span>
              </h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                @for (frame of video()!.frames!; track $index) {
                  <a [href]="frame" target="_blank"
                    class="card overflow-hidden aspect-video hover:ring-2 hover:ring-sky-400 transition-all group">
                    <img [src]="frame" [alt]="'Frame ' + ($index + 1)"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy" />
                  </a>
                }
              </div>
            </div>
          }

        </div>
      }
    </main>

    <!-- Modals -->
    @if (editingVideo()) {
      <app-edit-modal
        [video]="editingVideo()!"
        (saved)="onEdited()"
        (closed)="editingVideo.set(null)" />
    }

    @if (showDeleteConfirm() && video()) {
      <app-confirm-dialog
        title="Excluir vídeo"
        [message]="'Deseja excluir &quot;' + video()!.title + '&quot;? Esta ação não pode ser desfeita.'"
        confirmLabel="Excluir"
        (confirm)="onDeleteConfirm()"
        (cancel)="showDeleteConfirm.set(false)" />
    }
  `,
})
export class VideoDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly videoService = inject(VideoService);
  readonly theme = inject(ThemeService);

  video = signal<Video | null>(null);
  loading = signal(true);
  error = signal('');
  editingVideo = signal<Video | null>(null);
  showDeleteConfirm = signal(false);

  private pollSub?: Subscription;
  private videoId!: string;

  ngOnInit() {
    this.videoId = this.route.snapshot.paramMap.get('id')!;
    this.loadVideo();
    this.startPolling();
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  loadVideo() {
    this.loading.set(true);
    this.videoService.get(this.videoId).subscribe({
      next: (video) => {
        this.video.set(video);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o vídeo.');
        this.loading.set(false);
      },
    });
  }

  private startPolling() {
    this.pollSub = interval(8000).pipe(
      filter(() => {
        const status = this.video()?.status;
        return status === 'PENDING' || status === 'PROCESSING';
      }),
      switchMap(() => this.videoService.get(this.videoId))
    ).subscribe({
      next: (video) => this.video.set(video),
    });
  }

  onEdited() {
    this.editingVideo.set(null);
    this.loadVideo();
  }

  onDeleteConfirm() {
    this.videoService.delete(this.videoId).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.showDeleteConfirm.set(false),
    });
  }
}
