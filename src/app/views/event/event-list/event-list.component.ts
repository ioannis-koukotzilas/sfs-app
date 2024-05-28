import { Component } from '@angular/core';
import { Subscription, concatMap, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { Event } from '../../../models/entities/event';
import { Media } from '../../../models/entities/media';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
})
export class EventListComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  events: Event[] = [];

  currentPage: number = 1;
  totalPages: number = 0;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _loadingService: LoadingService,
    private _viewportScroller: ViewportScroller,
    private _titleService: Title
  ) {}

  ngOnInit(): void {
    this.getEvents();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getEvents(): void {
    const sub = this._route.data
      .pipe(
        concatMap(({ data }) => {
          if (data.events && data.events.length > 0) {
            this.events = [];
            this._viewportScroller.scrollToPosition([0, 0]);
            this.currentPage = data.currentPage;
            this.totalPages = Number(data.headers.get('X-WP-TotalPages'));
            this.initEvents(data.events);
            const mediaIds = this.events.map((x) => x.featuredMediaId).filter((id) => id !== null);
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

  private initEvents(events: any[]): void {
    const mappedEvents = events.map((data) => {
      let event = new Event();
      event.slug = data.slug;
      event.title = data.title.rendered;
      event.date = data.date;
      event.excerpt = data.excerpt.rendered;
      event.featuredMediaId = data.featured_media;

      return event;
    });

    this.events = [...this.events, ...mappedEvents];
  }

  private mapMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      this.events
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
    this._titleService.setTitle('Δράσεις - Εκδηλώσεις' + ' - ' + this._appTitle);
  }

  onPageChange(page: number): void {
    this._router.navigate(['/events/page', page]);
  }
}
