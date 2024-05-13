import { Component } from '@angular/core';
import { Subscription, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { Event } from '../../../models/entities/event';
import { Media } from '../../../models/entities/media';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
})
export class EventListComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  loading = false;

  events: Event[] = [];

  currentPage: number = 1;
  perPage: number = 6;
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
      this.getEvents(this.currentPage, this.perPage);
    });

    this._subscriptions.add(routeParamsSubscription);
  }

  private getEvents(page: number, perPage: number): void {
    this.loading = true;
    const eventsSubscription = this._wpService
      .getEvents(page, perPage)
      .pipe(
        switchMap(({ data, headers }) => {
          if (data && data.length > 0) {
            this.events = [];
            this.initEvents(data);
            this.totalPages = Number(headers.get('X-WP-TotalPages'));
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
          this.loading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
        },
      });

    this._subscriptions.add(eventsSubscription);
  }

  onPageChange(page: number): void {
    this._router.navigate(['/events/page', page]);
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
}
