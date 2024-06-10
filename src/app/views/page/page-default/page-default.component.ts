import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { Title } from '@angular/platform-browser';
import { Subscription, tap } from 'rxjs';
import { PageDefault } from '../../../models/entities/pageDefault';
import { environment } from '../../../../environments/environment';
import { LoadingService } from '../../../services/loading.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-page-default',
  templateUrl: './page-default.component.html',
  styleUrl: './page-default.component.css',
})
export class PageDefaultComponent implements OnInit, OnDestroy {
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
