import { Component } from '@angular/core';
import { Subscription, concatMap, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../models/entities/category';
import { ActivatedRoute, Router } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { News } from '../../../models/entities/news';
import { Media } from '../../../models/entities/media';
import { LoadingService } from '../../../services/loading.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-news-category-detail',
  templateUrl: './news-category-detail.component.html',
  styleUrl: './news-category-detail.component.css',
})
export class NewsCategoryDetailComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  category!: Category;
  news?: News[];

  currentPage: number = 1;
  perPage: number = 4;
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
    this.getCategory();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getCategory(): void {
    const sub = this._route.data
      .pipe(
        concatMap(({ data }) => {
          if (data) {
            this.news = [];
            this._viewportScroller.scrollToPosition([0, 0]);
            this.initCategory(data.category);
            this.currentPage = data.currentPage;
            return this._wpService.getNewsByNewsCategoriesIds([this.category.id], this.currentPage, this.perPage);
          }

          return of({ news: null, headers: null });
        }),
        concatMap(({ news, headers }) => {
          if (news && news.length > 0) {
            this.category.news = this.initNews(news);
            this.totalPages = Number(headers.get('X-WP-TotalPages'));
            const mediaIds = news.map((x) => x.featuredMediaId).filter((id) => id !== null);
            return this._wpService.getMediaByIds(mediaIds);
          }

          return of([]);
        }),
        tap((newsFeaturedMedia) => {
          if (newsFeaturedMedia && newsFeaturedMedia.length > 0) {
            this.mapNewsMedia(newsFeaturedMedia);
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

  private initCategory(category: any): void {
    this.category = new Category();
    this.category.id = category.id;
    this.category.slug = category.slug;
    this.category.name = category.name;
    this.category.description = category.description;
    this.category.parent = category.parent;
  }

  private initNews(newsArr: any[]): News[] {
    this.news = newsArr.map((data) => {
      let newsItem = new News();
      newsItem.slug = data.slug;
      newsItem.date = data.date;
      newsItem.title = data.title.rendered;
      newsItem.excerpt = data.excerpt.rendered;
      newsItem.featuredMediaId = data.featured_media;
      return newsItem;
    });

    return this.news;
  }

  private mapNewsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const newsItem = this.news?.find((x) => x.featuredMediaId === mediaItem.id);
      if (newsItem) {
        newsItem.featuredMedia = this.initFeaturedMedia(mediaItem);
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
    if (this.category.name) {
      this._titleService.setTitle(this.category.name + ' - ' + this._appTitle);
    } else {
      this._titleService.setTitle(this._appTitle);
    }
  }

  onPageChange(page: number): void {
    this._router.navigate([`/news/category/${this.category.slug}/page`, page]);
  }
}
