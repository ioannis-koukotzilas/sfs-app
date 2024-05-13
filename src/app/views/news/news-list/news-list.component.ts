import { Component } from '@angular/core';
import { Subscription, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { News } from '../../../models/entities/news';
import { Media } from '../../../models/entities/media';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css',
})
export class NewsListComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  loading = false;

  news: News[] = [];

  currentPage: number = 1;
  perPage: number = 4;
  totalPages: number = 0;

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _titleService: Title
  ) {}

  ngOnInit(): void {
    this.checkRouteParams();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private checkRouteParams(): void {
    const routeParamsSubscription = this._activatedRoute.params.subscribe((params) => {
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.getNews(this.currentPage, this.perPage);
    });

    this._subscriptions.add(routeParamsSubscription);
  }

  private getNews(page: number, perPage: number): void {
    this.loading = true;
    const newsSubscription = this._wpService
      .getNewsList(page, perPage)
      .pipe(
        switchMap(({ data, headers }) => {
          if (data && data.length > 0) {
            this.news = [];
            this.initNews(data);
            this.totalPages = Number(headers.get('X-WP-TotalPages'));
            const mediaIds = this.news.map((x) => x.featuredMediaId).filter((id) => id !== null);
            return this._wpService.getMediaByIds(mediaIds);
          } else {
            return of([]);
          }
        }),
        tap((featuredMedia) => {
          if (featuredMedia && featuredMedia.length > 0) {
            this.mapMedia(featuredMedia);
          }
        })
      )
      .subscribe({
        next: () => {
          this.initTitle();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
        },
      });

    this._subscriptions.add(newsSubscription);
  }

  onPageChange(page: number): void {
    this._router.navigate(['/news/page', page]);
  }

  private initNews(news: any[]): void {
    const mappedNews = news.map((data) => {
      let newsItem = new News();
      newsItem.slug = data.slug;
      newsItem.title = data.title.rendered;
      newsItem.date = data.date;
      newsItem.excerpt = data.excerpt.rendered;
      newsItem.featuredMediaId = data.featured_media;
      return newsItem;
    });

    this.news = [...this.news, ...mappedNews];
  }

  private mapMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      this.news
        .filter((x) => x.featuredMediaId === mediaItem.id)
        .forEach((newsItem) => {
          newsItem.featuredMedia = this.initFeaturedMedia(mediaItem);
        });
    });
  }

  private initFeaturedMedia(media: any): Media {
    let featuredMedia = new Media();
    featuredMedia.id = media.id;
    featuredMedia.link = media.link;
    featuredMedia.size = this._mediaService.mapMediaSize(media);

    return featuredMedia;
  }

  private initTitle(): void {
    this._titleService.setTitle('Ενημέρωση' + ' - ' + this._appTitle);
  }
}
