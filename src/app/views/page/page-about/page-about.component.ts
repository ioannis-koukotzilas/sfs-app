import { Component } from '@angular/core';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PageDefault } from '../../../models/entities/pageDefault';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-page-about',
  templateUrl: './page-about.component.html',
  styleUrl: './page-about.component.css',
})
export class PageAboutComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  loading = false;

  page!: PageDefault;

  constructor(private _route: ActivatedRoute, private _wpService: WpService, private _titleService: Title) {}

  ngOnInit(): void {
    this.getPage();
  }

  ngOnDestroy(): void {}

  private checkRouteParams(): Observable<PageDefault | null> {
    return this._route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        return slug ? this._wpService.getPageDefault(slug) : of(null);
      })
    );
  }

  private getPage(): void {
    this.loading = true;
    const routeParamsSubscription = this.checkRouteParams().subscribe({
      next: (data) => {
        if (data) {
          this.initPageData(data);
          this.initTitle();
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      },
    });

    this._subscriptions.add(routeParamsSubscription);
  }

  private initPageData(data: any): void {
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
