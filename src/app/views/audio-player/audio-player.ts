import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-audio-player',
  imports: [],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.css',
})
export class AudioPlayer {
  @ViewChild('audio', { static: true })
  audioRef!: ElementRef<HTMLAudioElement>;

  private readonly streamUrl = 'https://live.kocmoc.cc/listen/kocmoc-1/stream';

  isLoading = false;
  isPlaying = false;

  toggleAudio(): void {
    if (this.isPlaying || this.isLoading) {
      this.stop();
      return;
    }

    this.play();
  }

  async play(): Promise<void> {
    const audio = this.audioRef.nativeElement;

    this.stop();

    this.isLoading = true;

    const freshUrl = `${this.streamUrl}?_=${Date.now()}`;

    audio.src = freshUrl;

    try {
      await audio.play();
      // Final state is also handled by the `playing` event.
    } catch (error) {
      this.isLoading = false;
      this.isPlaying = false;

      console.error('Audio play failed:', error);
    }
  }

  stop(): void {
    const audio = this.audioRef.nativeElement;

    audio.pause();
    audio.removeAttribute('src');
    audio.load();

    this.isLoading = false;
    this.isPlaying = false;
  }

  onPlaying(): void {
    this.isLoading = false;
    this.isPlaying = true;
  }

  onError(): void {
    this.isLoading = false;
    this.isPlaying = false;
  }
}
