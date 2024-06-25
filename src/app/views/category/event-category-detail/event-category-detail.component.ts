import { Component } from '@angular/core';
import { Subscription, concatMap, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../models/entities/category';
import { ActivatedRoute, Router } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { Event } from '../../../models/entities/event';
import { Media } from '../../../models/entities/media';
import { LoadingService } from '../../../services/loading.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-event-category-detail',
  templateUrl: './event-category-detail.component.html',
  styleUrl: './event-category-detail.component.css',
})
export class EventCategoryDetailComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  category!: Category;
  events?: Event[];

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
            this._viewportScroller.scrollToPosition([0, 0]);
            this.initCategory(data.category);
            this.currentPage = data.currentPage;
            return this._wpService.getEventsByEventCategoriesIds([this.category.id], this.currentPage, this.perPage);
          }

          return of({ events: null, headers: null });
        }),
        concatMap(({ events, headers }) => {
          if (events && events.length > 0) {
            this.events = [];
            this.category.events = this.initEvents(events);
            this.totalPages = Number(headers.get('X-WP-TotalPages'));
            const mediaIds = events.map((x) => x.featuredMediaId).filter((id) => id !== null);
            return this._wpService.getMediaByIds(mediaIds);
          }

          return of([]);
        }),
        tap((eventsfeaturedMedia) => {
          if (eventsfeaturedMedia && eventsfeaturedMedia.length > 0) {
            this.mapEventsMedia(eventsfeaturedMedia);
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

  private initEvents(eventsArr: any[]): Event[] {
    this.events = eventsArr.map((data) => {
      let event = new Event();
      event.slug = data.slug;
      event.date = data.date;
      event.title = data.title.rendered;
      event.excerpt = data.excerpt.rendered;
      event.featuredMediaId = data.featured_media;
      return event;
    });

    return this.events;
  }

  private mapEventsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const eventItem = this.events?.find((x) => x.featuredMediaId === mediaItem.id);
      if (eventItem) {
        eventItem.featuredMedia = this.initFeaturedMedia(mediaItem);
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
      this._titleService.setTitle(this._appTitle ?? '');
    }
  }

  onPageChange(page: number): void {
    this._router.navigate([`/news/category/${this.category.slug}/page`, page]);
  }
}
