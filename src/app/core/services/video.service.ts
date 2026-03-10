import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video, CreateVideoRequest, UpdateVideoRequest } from '../models/video.model';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/videos';

  list(): Observable<Video[]> {
    return this.http.get<Video[]>(this.baseUrl);
  }

  get(id: string): Observable<Video> {
    return this.http.get<Video>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateVideoRequest): Observable<Video> {
    return this.http.post<Video>(this.baseUrl, data);
  }

  update(id: string, data: UpdateVideoRequest): Observable<Video> {
    return this.http.put<Video>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  upload(id: string, file: File): Observable<Video> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Video>(`${this.baseUrl}/${id}/upload`, formData);
  }
}
