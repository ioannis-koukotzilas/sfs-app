import { Component } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PageDefault } from '../../../models/entities/pageDefault';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { Title } from '@angular/platform-browser';
import { LoadingService } from '../../../services/loading.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-page-about',
  templateUrl: './page-about.component.html',
  styleUrl: './page-about.component.css',
})
export class PageAboutComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  page!: PageDefault;

  constructor(
    private _route: ActivatedRoute,
    private _wpService: WpService,
    private _titleService: Title,
    private _loadingService: LoadingService,
    private _viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.getPage();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getPage(): void {
    const sub = this._route.data
      .pipe(
        tap(({ page }) => {
          if (page) {
            this._viewportScroller.scrollToPosition([0, 0]);
            this.initPage(page);
          }
        })
      )
      .subscribe({
        next: () => {
          this.initTitle();
          this._loadingService.set(false);
        },
        error: (error) => {
          console.error('Error:', error);
          this._loadingService.set(false);
        },
      });

    this._subscriptions.add(sub);
  }

  private initPage(data: any): void {
    this.page = new PageDefault();
    this.page.title = data.title.rendered;
    this.page.content = data.content.rendered;
  }

  private initTitle(): void {
    if (this.page.title) {
      this._titleService.setTitle(this.page.title + ' - ' + this._appTitle);
    } else {
      this._titleService.setTitle(this._appTitle);
    }
  }
}
