import { Component } from '@angular/core';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';

@Component({
  selector: 'app-loading-progress',
  templateUrl: './loading-progress.component.html',
  styleUrl: './loading-progress.component.css',
})
export class LoadingProgressComponent {
  isLoading$ = this.loadingIndicatorService.isLoading;
  progress$ = this.loadingIndicatorService.progress;

  constructor(public loadingIndicatorService: LoadingIndicatorService) {}
}
