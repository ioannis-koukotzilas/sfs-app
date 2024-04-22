import { Component } from '@angular/core';
import { Observable, Subscription, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../models/entities/category';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { Event } from '../../../models/entities/event';
import { Media } from '../../../models/entities/media';

@Component({
  selector: 'app-event-category-detail',
  templateUrl: './event-category-detail.component.html',
  styleUrl: './event-category-detail.component.css',
})
export class EventCategoryDetailComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  loading = false;

  category!: Category;

  events?: Event[];

  constructor(private _route: ActivatedRoute, private _wpService: WpService, private _mediaService: MediaService, private _titleService: Title) {}

  ngOnInit(): void {
    this.getCategory();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private checkRouteParams(): Observable<Category | null> {
    return this._route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        return slug ? this._wpService.getCategory(slug) : of(null);
      })
    );
  }

  private getCategory(): void {
    this.loading = true;
    const routeParamsSubscription = this.checkRouteParams()
      .pipe(
        tap((category) => {
          if (category) {
            this.initCategory(category);
          } else {
            throw new Error('No category found');
          }
        }),
        switchMap(() => {
          return this._wpService.getEventsByCategoryId(this.category.id);
        }),
        switchMap((events) => {
          if (events) {
            this.category.events = this.initEvents(events);
            const mediaIds = events.map((x) => x.featuredMediaId).filter((id) => id !== null);
            return this._wpService.getMediaByIds(mediaIds);
          }

          return of(null);
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

    this._subscriptions.add(routeParamsSubscription);
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

  private mapMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const newsItem = this.events?.find((x) => x.featuredMediaId === mediaItem.id);
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
}
