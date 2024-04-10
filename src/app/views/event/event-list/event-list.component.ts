import { Component } from '@angular/core';
import { Subscription, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { Event } from '../../../models/entities/event';
import { Media } from '../../../models/entities/media';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
})
export class EventListComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  events: Event[] = [];

  page: number = 1;
  perPage: number = 1;
  hasMore = true;

  constructor(private _wpService: WpService, private _mediaService: MediaService, private _titleService: Title) {}

  ngOnInit(): void {
    this.getEvents(this.page, this.perPage);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getEvents(page: number, perPage: number): void {
    const eventsSubscription = this._wpService
      .getEvents(page, perPage)
      .pipe(
        switchMap(({ data, headers }) => {
          if (data && data.length > 0) {
            this.initEvents(data);
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

    this._subscriptions.add(eventsSubscription);
  }

  loadMore(): void {
    this.page += 1;
    this.getEvents(this.page, this.perPage);
  }

  private initEvents(events: any[]): void {
    const mappedEvents = events.map((data) => {
      let event = new Event();
      event.slug = data.slug;
      event.title = data.title.rendered;
      event.excerpt = data.excerpt.rendered;
      event.featuredMediaId = data.featured_media;

      return event;
    });

    this.events = [...this.events, ...mappedEvents];
  }

  private mapMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const event = this.events.find((x) => x.featuredMediaId === mediaItem.id);
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
