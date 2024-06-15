import { Component, OnDestroy, OnInit } from '@angular/core';
import { Edition } from '../../../models/entities/edition';
import { ActivatedRoute, Router } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { Title } from '@angular/platform-browser';
import { Subscription, concatMap, of, tap } from 'rxjs';
import { News } from '../../../models/entities/news';
import { Event } from '../../../models/entities/event';
import { environment } from '../../../../environments/environment';
import { Media } from '../../../models/entities/media';
import { MediaService } from '../../../services/media.service';
import { LoadingService } from '../../../services/loading.service';
import { ViewportScroller } from '@angular/common';
import { CoverImage } from '../../../models/entities/cover';
import { MetaService } from '../../../services/meta.service';

@Component({
  selector: 'app-edition-detail',
  templateUrl: './edition-detail.component.html',
  styleUrl: './edition-detail.component.css',
})
export class EditionDetailComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  edition!: Edition;
  events!: Event[];
  news!: News[];
  shareData?: ShareData;

  coverImage?: CoverImage;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _loadingService: LoadingService,
    private _titleService: Title,
    private _metaService: MetaService,
    private _viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.getEdition();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getEdition(): void {
    const sub = this._route.data
      .pipe(
        tap(({ data }) => {
          if (data) {
            this._viewportScroller.scrollToPosition([0, 0]);
            this.initEdition(data);
          } else {
            throw new Error('No edition found');
          }
        }),
        concatMap(() => {
          if (this.edition.featuredMediaId && this.edition.featuredMediaId > 0) {
            return this._wpService.getMediaById(this.edition.featuredMediaId);
          }

          return of(null);
        }),
        concatMap((featuredMedia) => {
          if (featuredMedia) {
            this.edition.featuredMedia = this.initFeaturedMedia(featuredMedia);
            this.initCoverImage();
          }

          if (this.edition.galleryMediaIds && this.edition.galleryMediaIds.length > 0) {
            return this._wpService.getMediaByIds(this.edition.galleryMediaIds);
          }

          return of(null);
        }),
        concatMap((galleryMedia) => {
          if (galleryMedia) {
            this.edition.galleryMedia = this.initGalleryMedia(galleryMedia);
          }

          return this._wpService.getEventsByEditionId(this.edition.id, 8);
        }),
        concatMap((events) => {
          if (events && events.length > 0) {
            this.initEvents(events);
            const mediaIds = this.events.map((x) => x.featuredMediaId).filter((id) => id !== null);

            if (mediaIds && mediaIds.length > 0) {
              return this._wpService.getMediaByIds(mediaIds);
            } else {
              return of([]);
            }
          }

          return of([]);
        }),
        concatMap((eventsFeaturedMedia) => {
          if (eventsFeaturedMedia && eventsFeaturedMedia.length > 0) {
            this.mapEventsMedia(eventsFeaturedMedia);
          }

          return this._wpService.getNewsByEditionId(this.edition.id, 8);
        }),
        concatMap((news) => {
          if (news && news.length > 0) {
            this.initNews(news);
            const mediaIds = this.news.map((x) => x.featuredMediaId).filter((id) => id !== null);

            if (mediaIds && mediaIds.length > 0) {
              return this._wpService.getMediaByIds(mediaIds);
            } else {
              return of([]);
            }
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

  private initEdition(edition: any): void {
    this.edition = new Edition();
    this.edition.id = edition.id;
    this.edition.title = edition.title.rendered;
    this.edition.content = edition.content.rendered;
    this.edition.excerpt = edition.excerpt.rendered;
    this.edition.featuredMediaId = edition.featured_media;
    this.edition.galleryMediaIds = edition.acf.gallery;
    this.edition.coverTitle = edition.acf.cover_title;
    this.edition.coverLinkSlug = edition.cover_link_info?.slug;
    this.edition.coverLinkPostType = edition.cover_link_info?.post_type;
  }

  private initCoverImage(): void {
    this.coverImage = new CoverImage();
    this.coverImage.media = this.edition.featuredMedia;
    this.coverImage.showTitle = true;
    this.coverImage.title = this.edition.title;
    this.coverImage.linkSlug = this.edition.coverLinkSlug;
    this.coverImage.linkPostType = this.edition.coverLinkPostType;
  }

  private initFeaturedMedia(media: any): Media {
    let featuredMedia = new Media();
    featuredMedia.id = media.id;
    featuredMedia.link = media.link;
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

  private initEvents(events: any[]): void {
    this.events = events.map((data) => {
      let event = new Event();
      event.slug = data.slug;
      event.date = data.date;
      event.title = data.title.rendered;
      event.excerpt = data.excerpt.rendered;
      event.featuredMediaId = data.featured_media;
      return event;
    });
  }

  private mapEventsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const eventItem = this.events.find((x) => x.featuredMediaId === mediaItem.id);
      if (eventItem) {
        eventItem.featuredMedia = this.initFeaturedMedia(mediaItem);
      }
    });
  }

  private initNews(news: any[]): void {
    this.news = news.map((data) => {
      let news = new News();
      news.slug = data.slug;
      news.date = data.date;
      news.title = data.title.rendered;
      news.excerpt = data.excerpt.rendered;
      news.featuredMediaId = data.featured_media;
      return news;
    });
  }

  private mapNewsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const newsItem = this.news.find((x) => x.featuredMediaId === mediaItem.id);
      if (newsItem) {
        newsItem.featuredMedia = this.initFeaturedMedia(mediaItem);
      }
    });
  }

  private initTitle(): void {
    if (this.edition.title) {
      this._titleService.setTitle(this.edition.title + ' - ' + this._appTitle);
    } else {
      this._titleService.setTitle(this._appTitle);
    }
  }

  private initMetaData(): void {
    this._metaService.updateBaseTitle(this._appTitle);
    this._metaService.updateBaseDescription(this._metaService.formatDescription(this.edition.excerpt));
    this._metaService.updateUrl(environment.baseUrl + this._router.url);
    this._metaService.updateTitle(this._appTitle);
    this._metaService.updateDescription(this._metaService.formatDescription(this.edition.excerpt));
    this._metaService.updateImage(this.edition?.featuredMedia?.size?.xLarge?.src ?? '');
  }

  initShareData() {
    this.shareData = { title: '', text: '', url: '' };
    this.shareData.title = this.edition.title.replace(/<[^>]*>/g, '');
    this.shareData.text = this.edition.excerpt.replace(/<[^>]*>/g, '');
    this.shareData.url = environment.baseUrl + this._router.url;
  }
}
