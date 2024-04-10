import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoadingIndicatorService } from '../services/loading-indicator.service';

@Injectable()
export class HttpLoadingInterceptor implements HttpInterceptor {
  constructor(private loadingIndicatorService: LoadingIndicatorService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingIndicatorService.start();
    return next.handle(req).pipe(finalize(() => this.loadingIndicatorService.complete()));
  }
}
