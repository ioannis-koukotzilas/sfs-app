import { Component } from '@angular/core';
import { Subscription, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { News } from '../../../models/entities/news';
import { Media } from '../../../models/entities/media';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css',
})
export class NewsListComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  news: News[] = [];

  page: number = 1;
  perPage: number = 1;
  hasMore = true;

  constructor(private _wpService: WpService, private _mediaService: MediaService, private _titleService: Title) {}

  ngOnInit(): void {
    this.getNews(this.page, this.perPage);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getNews(page: number, perPage: number): void {
    const newsSubscription = this._wpService
      .getNewsList(page, perPage)
      .pipe(
        switchMap(({ data, headers }) => {
          if (data && data.length > 0) {
            this.initNews(data);
            const totalPages = Number(headers.get('X-WP-TotalPages'));
            if (page >= totalPages) {
              this.hasMore = false;
            }
            const mediaIds = data.map((x) => x.featuredMediaId).filter((id) => id !== null);
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
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });

    this._subscriptions.add(newsSubscription);
  }

  loadMore(): void {
    this.page += 1;
    this.getNews(this.page, this.perPage);
  }

  private initNews(news: any[]): void {
    const mappedNews = news.map((data) => {
      let newsItem = new News();
      newsItem.slug = data.slug;
      newsItem.title = data.title.rendered;
      newsItem.excerpt = data.excerpt.rendered;
      newsItem.featuredMediaId = data.featured_media;

      return newsItem;
    });

    this.news = [...this.news, ...mappedNews];
  }

  private mapMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const event = this.news.find((x) => x.featuredMediaId === mediaItem.id);
      if (event) {
        event.featuredMedia = this.initFeaturedMedia(mediaItem);
      }
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
    this._titleService.setTitle('Editions' + ' - ' + this._appTitle);
  }
}
