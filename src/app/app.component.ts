import { Component, OnDestroy, Renderer2, ViewChild, afterNextRender } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnDestroy {
  private _subscriptions: Subscription = new Subscription();

  title = 'skouries-app';

  private bodyClass: string | null = null;

  private classMapping: { [key: string]: string } = {
    home: 'dark',
    about: 'dark',
  };

  constructor(private _router: Router, private _loadingService: LoadingService, private _renderer: Renderer2) {
    afterNextRender(() => {
      this.checkRouterEvents();
    }); 
  }

  private checkRouterEvents(): void {
    const sub = this._router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this._loadingService.set(true);
      } else if (event instanceof NavigationEnd) {
        this.updateBodyClass(event);
      }
    });

    this._subscriptions.add(sub);
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  private updateBodyClass(event: NavigationEnd): void {
    if (this.bodyClass) {
      this.bodyClass.split(' ').forEach((className) => {
        this._renderer.removeClass(document.body, className);
      });
      this.bodyClass = null;
    }

    const currentUrl = event.urlAfterRedirects.split('/')[1];
    const baseClassName = `route-${currentUrl}`;
    this._renderer.addClass(document.body, baseClassName);

    let classesToAdd = [baseClassName];

    if (this.classMapping[currentUrl]) {
      const additionalClass = this.classMapping[currentUrl];
      this._renderer.addClass(document.body, additionalClass);
      classesToAdd.push(additionalClass);
    }

    this.bodyClass = classesToAdd.join(' ');
  }
}
