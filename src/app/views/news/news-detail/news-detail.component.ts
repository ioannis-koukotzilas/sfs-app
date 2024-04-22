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

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css',
})
export class NewsDetailComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  loading = false;

  news!: News;
  events!: Event[];

  shareData?: ShareData;

  constructor(private _route: ActivatedRoute, private _wpService: WpService, private _mediaService: MediaService, private _titleService: Title) {}

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
    this.loading = true;
    const routeParamsSubscription = this.checkRouteParams()
      .pipe(
        tap((news) => {
          if (news) {
            this.initNews(news);
          } else {
            throw new Error('No news found');
          }
        }),
        switchMap(() => {
          if (this.news.categoryIds && this.news.categoryIds.length > 0) {
            return this._wpService.getCategoriesByPostId(this.news.id);
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

          return this._wpService.getEventsByNewsId(this.news.id, 8);
        }),
        tap((events) => {
          if (events && events.length > 0) {
            this.initEvents(events);
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
    this.news.categoryIds = news.tax_category;
    this.news.galleryMediaIds = news.acf.gallery;
  }

  private initFeaturedMedia(media: any): Media {
    let featuredMedia = new Media();
    featuredMedia.id = media.id;
    featuredMedia.link = media.link;
    featuredMedia.size = this._mediaService.mapMediaSize(media);

    return featuredMedia;
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

  private initGalleryMedia(mediaArray: any[]): Media[] {
    const galleryMedia = mediaArray.map((media) => {
      let galleryItem = new Media();
      galleryItem.id = media.id;
      galleryItem.link = media.link;
      galleryItem.size = this._mediaService.mapMediaSize(media);

      return galleryItem;
    });

    return galleryMedia;
  }

  private initEvents(events: any[]): void {
    this.events = events.map((data) => {
      let event = new Event();
      event.slug = data.slug;
      event.title = data.title.rendered;
      event.excerpt = data.excerpt.rendered;
      return event;
    });
  }

  private initTitle(): void {
    if (this.news.title) {
      this._titleService.setTitle(this.news.title + ' - ' + this._appTitle);
    } else {
      this._titleService.setTitle(this._appTitle);
    }
  }

  initShareData() {
    this.shareData = { title: '', text: '', url: '' };
    this.shareData.title = this.news.title.replace(/<[^>]*>/g, '');
    this.shareData.text = this.news.excerpt.replace(/<[^>]*>/g, '');
    this.shareData.url = window.location.href;
  }
}
