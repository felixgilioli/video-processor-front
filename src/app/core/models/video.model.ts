export type VideoStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface Video {
  id: string;
  title: string;
  description: string;
  status: VideoStatus;
  createdAt: string;
  url?: string;
  videoUrl?: string;
  zipUrl?: string;
  firstFrameUrl?: string;
  frames?: string[];
}

export interface CreateVideoRequest {
  title: string;
  description: string;
}

export interface UpdateVideoRequest {
  title: string;
  description: string;
}
