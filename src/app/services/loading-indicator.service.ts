import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingIndicatorService {
  isLoading = new BehaviorSubject<boolean>(false);
  progress = new BehaviorSubject<number>(0);

  private timer: any;

  start() {
    this.isLoading.next(true);
    this.progress.next(10);
    this.timer = setInterval(() => {
      const currentProgress = this.progress.getValue();
      const nextProgress = currentProgress + 5;
      if (nextProgress > 90) {
        this.clearTimer();
        this.progress.next(90);
      } else {
        this.progress.next(nextProgress);
      }
    }, 200);
  }

  complete() {
    this.progress.next(100);
    this.clearTimer();
    this.isLoading.next(false);
    setTimeout(() => this.progress.next(0), 300);
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
