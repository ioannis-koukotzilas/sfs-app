import { Component } from '@angular/core';
import { Subscription, concatMap, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { News } from '../../../models/entities/news';
import { Media } from '../../../models/entities/media';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css',
})
export class NewsListComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  news: News[] = [];

  currentPage: number = 1;
  totalPages: number = 0;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _loadingService: LoadingService,
    private _viewportScroller: ViewportScroller,
    private _titleService: Title
  ) {}

  ngOnInit(): void {
    this.getNews();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getNews(): void {
    const sub = this._route.data
      .pipe(
        concatMap(({ data }) => {
          if (data.news && data.news.length > 0) {
            this.news = [];
            this._viewportScroller.scrollToPosition([0, 0]);
            this.currentPage = data.currentPage;
            this.totalPages = Number(data.headers.get('X-WP-TotalPages'));
            this.initNews(data.news);
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
          this._loadingService.set(false);
        },
        error: (error) => {
          console.error('Error:', error);
          this._loadingService.set(false);
        },
      });

    this._subscriptions.add(sub);
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

  onPageChange(page: number): void {
    this._router.navigate(['/news/page', page]);
  }
}
