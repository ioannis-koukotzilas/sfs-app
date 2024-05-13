import { Component, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { DynamicHostDirective } from './directives/dynamic-host.directive';
import { ViewContainerRefService } from './services/view-container-ref.service';

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

  @ViewChild(DynamicHostDirective, { static: true }) dynamicHost!: DynamicHostDirective;

  constructor(private router: Router, private renderer: Renderer2, private _viewContainerRefService: ViewContainerRefService) {
    this.checkRouteParams();
  }

  ngAfterViewInit() {
    this._viewContainerRefService.setHostViewContainerRef(this.dynamicHost.viewContainerRef);
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  private checkRouteParams(): void {
    const routerParamsSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateBodyClass(event);
      });

    this._subscriptions.add(routerParamsSubscription);
  }

  private updateBodyClass(event: NavigationEnd): void {
    if (this.bodyClass) {
      this.bodyClass.split(' ').forEach((className) => {
        this.renderer.removeClass(document.body, className);
      });
      this.bodyClass = null;
    }

    const currentUrl = event.urlAfterRedirects.split('/')[1];
    const baseClassName = `route-${currentUrl}`;
    this.renderer.addClass(document.body, baseClassName);

    let classesToAdd = [baseClassName];

    if (this.classMapping[currentUrl]) {
      const additionalClass = this.classMapping[currentUrl];
      this.renderer.addClass(document.body, additionalClass);
      classesToAdd.push(additionalClass);
    }

    this.bodyClass = classesToAdd.join(' ');
  }
}
