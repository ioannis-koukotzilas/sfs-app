import { Component } from '@angular/core';
import { Observable, Subscription, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { News } from '../../../models/entities/news';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { Event } from '../../../models/entities/event';
import { Media } from '../../../models/entities/media';
import { Category } from '../../../models/entities/category';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css',
})
export class NewsDetailComponent {
  private _subscriptions: Subscription = new Subscription();
  appTitle = environment.appTitle;
  loading = false;
  news!: News;
  shareData?: ShareData;

  constructor(
    private _route: ActivatedRoute,
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _titleService: Title,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.getNews();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private checkRouteParams(): Observable<News | null> {
    return this._route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        return slug ? this._wpService.getNews(slug) : of(null);
      })
    );
  }

  private getNews(): void {
    const routeParamsSubscription = this.checkRouteParams()
      .pipe(
        tap((news) => {
          if (news) {
            this.loading = true;
            this.initNews(news);
            this.viewportScroller.scrollToPosition([0, 0]);
          } else {
            throw new Error('No news found');
          }
        }),
        switchMap(() => {
          if (this.news.categoryIds && this.news.categoryIds.length > 0) {
            return this._wpService.getNewsCategoriesByPostId(this.news.id);
          }

          return of(null);
        }),
        switchMap((categories) => {
          if (categories) {
            this.news.categories = this.initCategories(categories);
          }

          if (this.news.featuredMediaId && this.news.featuredMediaId > 0) {
            return this._wpService.getMediaById(this.news.featuredMediaId);
          }

          return of(null);
        }),
        switchMap((featuredMedia) => {
          if (featuredMedia) {
            this.news.featuredMedia = this.initFeaturedMedia(featuredMedia);
          }

          if (this.news.galleryMediaIds && this.news.galleryMediaIds.length > 0) {
            return this._wpService.getMediaByIds(this.news.galleryMediaIds);
          }

          return of(null);
        }),
        switchMap((galleryMedia) => {
          if (galleryMedia) {
            this.news.galleryMedia = this.initGalleryMedia(galleryMedia);
          }

          return this._wpService.getNewsByNewsCategoriesIds(this.news.categoryIds, 1, 10);
        }),
        switchMap(({ news, headers }) => {
          if (news && news.length > 0) {
            const filteredNews = news.filter((article) => article.id !== this.news.id);
            this.news.relatedNews = this.initRelatedNews(filteredNews);
            const mediaIds = this.news.relatedNews.map((x) => x.featuredMediaId).filter((id) => id !== null);

            if (mediaIds && mediaIds.length > 0) {
              return this._wpService.getMediaByIds(mediaIds);
            } else {
              return of([]);
            }
          }

          return of([]);
        }),
        tap((relatedNewsFeaturedMedia) => {
          if (relatedNewsFeaturedMedia && relatedNewsFeaturedMedia.length > 0) {
            this.mapRelatedNewsMedia(relatedNewsFeaturedMedia);
          }
        })
      )
      .subscribe({
        next: () => {
          this.initTitle();
          this.initShareData();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
        },
      });

    this._subscriptions.add(routeParamsSubscription);
  }

  private initNews(news: any): void {
    this.news = new News();
    this.news.id = news.id;
    this.news.title = news.title.rendered;
    this.news.date = news.date;
    this.news.excerpt = news.excerpt.rendered;
    this.news.content = news.content.rendered;
    this.news.featuredMediaId = news.featured_media;
    this.news.categoryIds = news.news_category;
    this.news.galleryMediaIds = news.acf.gallery;
  }

  private initCategories(cats: any[]): Category[] {
    const categories = cats.map((cat) => {
      let category = new Category();
      category.id = cat.id;
      category.slug = cat.slug;
      category.name = cat.name;
      category.description = cat.description;
      category.parent = cat.parent;

      return category;
    });

    return categories;
  }

  private initFeaturedMedia(media: any): Media {
    let featuredMedia = new Media();
    featuredMedia.id = media.id;
    featuredMedia.link = media.link;
    featuredMedia.altText = media.alt_text;
    featuredMedia.caption = media.caption.rendered;
    featuredMedia.size = this._mediaService.mapMediaSize(media);

    return featuredMedia;
  }

  private initGalleryMedia(mediaArray: any[]): Media[] {
    const galleryMedia = mediaArray.map((media) => {
      let galleryItem = new Media();
      galleryItem.id = media.id;
      galleryItem.link = media.link;
      galleryItem.altText = media.alt_text;
      galleryItem.caption = media.caption.rendered;
      galleryItem.size = this._mediaService.mapMediaSize(media);

      return galleryItem;
    });

    return galleryMedia;
  }

  private initRelatedNews(news: any[]): News[] {
    const relatedNews = news.map((data) => {
      let relatedNewsItem = new News();
      relatedNewsItem.slug = data.slug;
      relatedNewsItem.date = data.date;
      relatedNewsItem.title = data.title.rendered;
      relatedNewsItem.excerpt = data.excerpt.rendered;
      relatedNewsItem.featuredMediaId = data.featured_media;
      return relatedNewsItem;
    });

    return relatedNews;
  }

  private mapRelatedNewsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const newsItem = this.news.relatedNews?.find((x) => x.featuredMediaId === mediaItem.id);
      if (newsItem) {
        newsItem.featuredMedia = this.initFeaturedMedia(mediaItem);
      }
    });
  }

  private initTitle(): void {
    if (this.news.title) {
      this._titleService.setTitle(this.news.title + ' - ' + this.appTitle);
    } else {
      this._titleService.setTitle(this.appTitle);
    }
  }

  initShareData() {
    this.shareData = { title: '', text: '', url: '' };
    this.shareData.title = this.news.title.replace(/<[^>]*>/g, '');
    this.shareData.text = this.news.excerpt.replace(/<[^>]*>/g, '');
    this.shareData.url = window.location.href;
  }
}
