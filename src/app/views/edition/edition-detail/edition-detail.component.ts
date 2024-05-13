import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Edition } from '../../../models/entities/edition';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { Title } from '@angular/platform-browser';
import { Observable, Subscription, of, switchMap, tap } from 'rxjs';
import { News } from '../../../models/entities/news';
import { Event } from '../../../models/entities/event';
import { environment } from '../../../../environments/environment';
import { Media } from '../../../models/entities/media';
import { MediaService } from '../../../services/media.service';
import { DynamicContentService } from '../../../services/dynamic-content.service';
import { DynamicHostDirective } from '../../../directives/dynamic-host.directive';
import { CoverImageComponent } from '../../../shared-views/cover-image/cover-image.component';
import { ViewContainerRefService } from '../../../services/view-container-ref.service';

@Component({
  selector: 'app-edition-detail',
  templateUrl: './edition-detail.component.html',
  styleUrl: './edition-detail.component.css',
})
export class EditionDetailComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  loading = false;

  edition!: Edition;
  events!: Event[];
  news!: News[];
  shareData?: ShareData;

  constructor(
    private _route: ActivatedRoute,
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _titleService: Title,
    private _viewContainerRefService: ViewContainerRefService,
    private _dynamicContentService: DynamicContentService
  ) {}

  ngOnInit(): void {
    this.getEdition();

    // const hostViewContainerRef = this._viewContainerRefService.getHostViewContainerRef();
    // if (hostViewContainerRef) {
    //   const compRef = this._dynamicContentService.loadComponent(hostViewContainerRef, CoverImageComponent);
    //   compRef.instance.coverImageSrc = this.imageUrl;
    // }
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();

    const hostViewContainerRef = this._viewContainerRefService.getHostViewContainerRef();
    if (hostViewContainerRef) {
      hostViewContainerRef.clear(); // This clears all components in the container
    }
  }

  private checkRouteParams(): Observable<Edition | null> {
    return this._route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        return slug ? this._wpService.getEdition(slug) : of(null);
      })
    );
  }

  private getEdition(): void {
    this.loading = true;
    const routeParamsSubscription = this.checkRouteParams()
      .pipe(
        tap((edition) => {
          if (edition) {
            this.initEdition(edition);
          } else {
            throw new Error('No edition found');
          }
        }),
        switchMap(() => {
          if (this.edition.featuredMediaId && this.edition.featuredMediaId > 0) {
            return this._wpService.getMediaById(this.edition.featuredMediaId);
          }

          return of(null);
        }),
        switchMap((featuredMedia) => {
          if (featuredMedia) {
            this.edition.featuredMedia = this.initFeaturedMedia(featuredMedia);

            const hostViewContainerRef = this._viewContainerRefService.getHostViewContainerRef();
            if (hostViewContainerRef) {
              const compRef = this._dynamicContentService.loadComponent(hostViewContainerRef, CoverImageComponent);
              compRef.instance.featuredMedia = this.edition.featuredMedia;
            }
          }

          if (this.edition.galleryMediaIds && this.edition.galleryMediaIds.length > 0) {
            return this._wpService.getMediaByIds(this.edition.galleryMediaIds);
          }

          return of(null);
        }),
        switchMap((galleryMedia) => {
          if (galleryMedia) {
            this.edition.galleryMedia = this.initGalleryMedia(galleryMedia);
          }

          return this._wpService.getEventsByEditionId(this.edition.id, 8);
        }),
        switchMap((events) => {
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
        switchMap((eventsFeaturedMedia) => {
          if (eventsFeaturedMedia && eventsFeaturedMedia.length > 0) {
            this.mapEventsMedia(eventsFeaturedMedia);
          }

          return this._wpService.getNewsByEditionId(this.edition.id, 8);
        }),
        switchMap((news) => {
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

  private initEdition(edition: any): void {
    this.edition = new Edition();
    this.edition.id = edition.id;
    this.edition.title = edition.title.rendered;
    this.edition.content = edition.content.rendered;
    this.edition.excerpt = edition.excerpt.rendered;
    this.edition.featuredMediaId = edition.featured_media;
    this.edition.galleryMediaIds = edition.acf.gallery;
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

  initShareData() {
    this.shareData = { title: '', text: '', url: '' };
    this.shareData.title = this.edition.title.replace(/<[^>]*>/g, '');
    this.shareData.text = this.edition.excerpt.replace(/<[^>]*>/g, '');
    this.shareData.url = window.location.href;
  }
}
