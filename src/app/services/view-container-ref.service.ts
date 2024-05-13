import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ViewContainerRefService {
  private _hostViewContainerRef!: ViewContainerRef;

  getHostViewContainerRef(): ViewContainerRef {
    return this._hostViewContainerRef;
  }

  setHostViewContainerRef(viewContainerRef: ViewContainerRef): void {
    this._hostViewContainerRef = viewContainerRef;
  }
}
