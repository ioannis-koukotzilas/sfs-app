import { Component } from '@angular/core';
import { Observable, Subscription, concatMap, of, switchMap, tap } from 'rxjs';
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
import { LoadingService } from '../../../services/loading.service';
import { MetaService } from '../../../services/meta.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css',
})
export class EventDetailComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  event!: Event;
  news!: News[];
  shareData?: ShareData;

  constructor(
    private _route: ActivatedRoute,
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _loadingService: LoadingService,
    private _titleService: Title,
    private _metaService: MetaService,
    private _viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.getEvent();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getEvent(): void {
    const sub = this._route.data
      .pipe(
        tap(({ data }) => {
          if (data) {
            this._viewportScroller.scrollToPosition([0, 0]);
            this.initEvent(data);
          } else {
            throw new Error('No event found');
          }
        }),
        concatMap(() => {
          if (this.event.categoryIds && this.event.categoryIds.length > 0) {
            return this._wpService.getEventCategoriesByPostId(this.event.id);
          }

          return of(null);
        }),
        concatMap((categories) => {
          if (categories) {
            this.event.categories = this.initCategories(categories);
          }

          if (this.event.featuredMediaId && this.event.featuredMediaId > 0) {
            return this._wpService.getMediaById(this.event.featuredMediaId);
          }

          return of(null);
        }),
        concatMap((featuredMedia) => {
          if (featuredMedia) {
            this.event.featuredMedia = this.initFeaturedMedia(featuredMedia);
          }

          if (this.event.galleryMediaIds && this.event.galleryMediaIds.length > 0) {
            return this._wpService.getMediaByIds(this.event.galleryMediaIds);
          }

          return of(null);
        }),
        concatMap((galleryMedia) => {
          if (galleryMedia) {
            this.event.galleryMedia = this.initGalleryMedia(galleryMedia);
          }

          return this._wpService.getEventsByEventCategoriesIds(this.event.categoryIds, 1, 10);
        }),
        concatMap(({ events, headers }) => {
          if (events && events.length > 0) {
            const filteredEvents = events.filter((article) => article.id !== this.event.id);
            this.event.relatedEvents = this.initRelatedEvents(filteredEvents);
            const mediaIds = this.event.relatedEvents.map((x) => x.featuredMediaId).filter((id) => id !== null);

            if (mediaIds && mediaIds.length > 0) {
              return this._wpService.getMediaByIds(mediaIds);
            } else {
              return of([]);
            }
          }

          return of([]);
        }),
        tap((relatedEventsFeaturedMedia) => {
          if (relatedEventsFeaturedMedia && relatedEventsFeaturedMedia.length > 0) {
            this.mapRelatedEventsMedia(relatedEventsFeaturedMedia);
          }
        })
      )
      .subscribe({
        next: () => {
          this.initTitle();
          this.initMetaData();
          this.initShareData();
          this._loadingService.set(false);
        },
        error: (error) => {
          console.error('Error:', error);
          this._loadingService.set(false);
        },
      });

    this._subscriptions.add(sub);
  }

  private initEvent(event: any): void {
    this.event = new Event();
    this.event.id = event.id;
    this.event.title = event.title.rendered;
    this.event.date = event.date;
    this.event.excerpt = event.excerpt.rendered;
    this.event.content = event.content.rendered;
    this.event.featuredMediaId = event.featured_media;
    this.event.categoryIds = event.event_category;
    this.event.galleryMediaIds = event.acf.gallery;
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
      galleryItem.size = this._mediaService.mapMediaSize(media);
      return galleryItem;
    });

    return galleryMedia;
  }

  private initRelatedEvents(events: any[]): Event[] {
    const relatedEvents = events.map((data) => {
      let relatedEventItem = new Event();
      relatedEventItem.slug = data.slug;
      relatedEventItem.date = data.date;
      relatedEventItem.title = data.title.rendered;
      relatedEventItem.excerpt = data.excerpt.rendered;
      relatedEventItem.featuredMediaId = data.featured_media;
      return relatedEventItem;
    });

    return relatedEvents;
  }

  private mapRelatedEventsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const newsItem = this.event.relatedEvents?.find((x) => x.featuredMediaId === mediaItem.id);
      if (newsItem) {
        newsItem.featuredMedia = this.initFeaturedMedia(mediaItem);
      }
    });
  }

  private initTitle(): void {
    if (this.event.title) {
      this._titleService.setTitle(this.event.title + ' - ' + this._appTitle);
    } else {
      this._titleService.setTitle(this._appTitle);
    }
  }

  private initMetaData(): void {
    this._metaService.updateBaseTitle(this._appTitle);
    this._metaService.updateBaseDescription(this._metaService.formatDescription(this.event.excerpt));
    this._metaService.updateUrl(window.location.href);
    this._metaService.updateTitle(this._appTitle);
    this._metaService.updateDescription(this._metaService.formatDescription(this.event.excerpt));
    this._metaService.updateImage(this.event?.featuredMedia?.size?.xLarge?.src ?? '');
  }

  private initShareData(): void {
    this.shareData = { title: '', text: '', url: '' };
    this.shareData.title = this.event.title.replace(/<[^>]*>/g, '');
    this.shareData.text = this.event.excerpt.replace(/<[^>]*>/g, '');
    this.shareData.url = window.location.href;
  }
}
