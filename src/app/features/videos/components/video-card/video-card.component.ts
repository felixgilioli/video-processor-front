import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Video } from '../../../../core/models/video.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { DatePipe } from '@angular/common';
import { VideoPlayerModalComponent } from '../video-player-modal/video-player-modal.component';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, DatePipe, VideoPlayerModalComponent],
  template: `
    <div class="card group hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      <!-- Thumbnail -->
      @if (video.videoUrl) {
        <button (click)="showPlayer.set(true)"
          class="block relative aspect-video bg-gray-100 overflow-hidden w-full text-left cursor-pointer">
          @if (video.firstFrameUrl) {
            <img [src]="video.firstFrameUrl" alt="{{ video.title }}"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
          } @else {
            <div class="w-full h-full flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
            </div>
          }
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-200">
            <div class="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
              <svg class="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </button>
      } @else {
        <a [routerLink]="['/videos', video.id]" class="block relative aspect-video bg-gray-100 overflow-hidden">
          @if (video.firstFrameUrl) {
            <img [src]="video.firstFrameUrl" alt="{{ video.title }}"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
          } @else {
            <div class="w-full h-full flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-200"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
            </div>
          }
          <!-- Status overlay for processing -->
          @if (video.status === 'PROCESSING') {
            <div class="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
              <div class="flex gap-1">
                <div class="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
                <div class="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
              </div>
            </div>
          }
        </a>
      }

      <!-- Content -->
      <div class="p-4 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-2">
          <a [routerLink]="['/videos', video.id]"
            class="text-sm font-semibold text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
            {{ video.title }}
          </a>
          <app-status-badge [status]="video.status" class="flex-shrink-0 mt-0.5" />
        </div>

        @if (video.description) {
          <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{{ video.description }}</p>
        }

        <div class="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ video.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
          <div class="flex items-center gap-1">
            @if (video.zipUrl) {
              <a [href]="video.zipUrl" download
                class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                title="Baixar ZIP">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </a>
            } @else {
              <span class="p-1.5 text-gray-200 cursor-not-allowed" title="ZIP não disponível">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </span>
            }
            <button (click)="edit.emit(video)"
              class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
              title="Editar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button (click)="delete.emit(video)"
              class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Excluir">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (showPlayer() && video.videoUrl) {
      <app-video-player-modal
        [videoUrl]="video.videoUrl"
        [title]="video.title"
        (closed)="showPlayer.set(false)" />
    }
  `,
})
export class VideoCardComponent {
  @Input({ required: true }) video!: Video;
  @Output() edit = new EventEmitter<Video>();
  @Output() delete = new EventEmitter<Video>();

  showPlayer = signal(false);
}
