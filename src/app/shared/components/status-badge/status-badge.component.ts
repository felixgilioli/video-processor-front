import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { VideoStatus } from '../../../core/models/video.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span [ngClass]="badgeClass" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium">
      <span [ngClass]="dotClass" class="w-1.5 h-1.5 rounded-full"></span>
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: VideoStatus;

  get label(): string {
    const labels: Record<VideoStatus, string> = {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      READY: 'Pronto',
      FAILED: 'Falhou',
    };
    return labels[this.status];
  }

  get badgeClass(): string {
    const classes: Record<VideoStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return classes[this.status];
  }

  get dotClass(): string {
    const classes: Record<VideoStatus, string> = {
      PENDING: 'bg-yellow-500',
      PROCESSING: 'bg-blue-500 animate-pulse',
      READY: 'bg-green-500',
      FAILED: 'bg-red-500',
    };
    return classes[this.status];
  }
}
