import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { Video } from '../../../../core/models/video.model';
import { VideoService } from '../../../../core/services/video.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { UploadModalComponent } from '../../components/upload-modal/upload-modal.component';
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    VideoCardComponent,
    UploadModalComponent,
    EditModalComponent,
    ConfirmDialogComponent,
  ],
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

          <div class="flex items-center gap-3">
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

            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                <span class="text-xs font-semibold text-sky-700 dark:text-sky-300">{{ userInitials() }}</span>
              </div>
              <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{{ userName() }}</span>
            </div>
            <button (click)="logout()"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Page title + actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Meus Vídeos</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            @if (!loading()) {
              {{ videos().length }} vídeo{{ videos().length !== 1 ? 's' : '' }} encontrado{{ videos().length !== 1 ? 's' : '' }}
            }
          </p>
        </div>
        <button class="btn-primary" (click)="showUpload.set(true)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          Upload de Vídeo
        </button>
      </div>

      <!-- Error state -->
      @if (error()) {
        <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl mb-6">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
          </svg>
          <span class="text-sm">{{ error() }}</span>
          <button (click)="loadVideos()" class="ml-auto text-sm font-medium underline hover:no-underline">
            Tentar novamente
          </button>
        </div>
      }

      <!-- Loading skeletons -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          @for (_ of [1,2,3,4,5,6,7,8]; track $index) {
            <div class="card overflow-hidden">
              <div class="skeleton aspect-video"></div>
              <div class="p-4 space-y-3">
                <div class="skeleton h-4 w-3/4 rounded"></div>
                <div class="skeleton h-3 w-1/2 rounded"></div>
                <div class="skeleton h-3 w-full rounded"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && videos().length === 0 && !error()) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Nenhum vídeo ainda</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            Faça o upload do seu primeiro vídeo para começar o processamento.
          </p>
          <button class="btn-primary" (click)="showUpload.set(true)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v16m8-8H4"/>
            </svg>
            Fazer Upload
          </button>
        </div>
      }

      <!-- Video grid -->
      @if (!loading() && videos().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
          @for (video of videos(); track video.id) {
            <app-video-card
              [video]="video"
              (edit)="onEdit($event)"
              (delete)="onDeleteRequest($event)" />
          }
        </div>
      }
    </main>

    <!-- Modals -->
    @if (showUpload()) {
      <app-upload-modal
        (uploaded)="onUploaded()"
        (closed)="showUpload.set(false)" />
    }

    @if (editingVideo()) {
      <app-edit-modal
        [video]="editingVideo()!"
        (saved)="onEdited()"
        (closed)="editingVideo.set(null)" />
    }

    @if (deletingVideo()) {
      <app-confirm-dialog
        title="Excluir vídeo"
        [message]="'Deseja excluir &quot;' + deletingVideo()!.title + '&quot;? Esta ação não pode ser desfeita.'"
        confirmLabel="Excluir"
        (confirm)="onDeleteConfirm()"
        (cancel)="deletingVideo.set(null)" />
    }
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly videoService = inject(VideoService);
  private readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  videos = signal<Video[]>([]);
  loading = signal(true);
  error = signal('');
  showUpload = signal(false);
  editingVideo = signal<Video | null>(null);
  deletingVideo = signal<Video | null>(null);
  userName = signal('');
  userInitials = signal('');

  private pollSub?: Subscription;

  ngOnInit() {
    const { name, initials } = this.auth.getUserInfo();
    this.userName.set(name);
    this.userInitials.set(initials);
    this.loadVideos();
    this.startPolling();
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  loadVideos() {
    this.loading.set(true);
    this.error.set('');
    this.videoService.list().subscribe({
      next: (videos) => {
        this.videos.set(videos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os vídeos.');
        this.loading.set(false);
      },
    });
  }

  private startPolling() {
    this.pollSub = interval(10000).pipe(
      switchMap(() => this.videoService.list())
    ).subscribe({
      next: (videos) => this.videos.set(videos),
    });
  }

  onEdit(video: Video) {
    this.editingVideo.set(video);
  }

  onDeleteRequest(video: Video) {
    this.deletingVideo.set(video);
  }

  onDeleteConfirm() {
    const video = this.deletingVideo();
    if (!video) return;
    this.videoService.delete(video.id).subscribe({
      next: () => {
        this.videos.update(list => list.filter(v => v.id !== video.id));
        this.deletingVideo.set(null);
      },
      error: () => this.deletingVideo.set(null),
    });
  }

  onUploaded() {
    this.showUpload.set(false);
    this.loadVideos();
  }

  onEdited() {
    this.editingVideo.set(null);
    this.loadVideos();
  }

  logout() {
    this.auth.logout();
  }
}
