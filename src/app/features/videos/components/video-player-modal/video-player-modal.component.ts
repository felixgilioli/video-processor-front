import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-video-player-modal',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in"
      (click)="closed.emit()" (keydown.escape)="closed.emit()">
      <div class="relative w-full max-w-4xl" (click)="$event.stopPropagation()">
        <button
          class="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
          (click)="closed.emit()"
          title="Fechar">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <video
          class="w-full rounded-xl shadow-2xl bg-black"
          [src]="videoUrl"
          controls
          autoplay>
        </video>
        <p class="mt-3 text-center text-sm text-white/70 truncate">{{ title }}</p>
      </div>
    </div>
  `,
})
export class VideoPlayerModalComponent {
  @Input({ required: true }) videoUrl!: string;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();
}
