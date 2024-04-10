import { Component } from '@angular/core';
import { Subscription, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { News } from '../../../models/entities/news';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { Event } from '../../../models/entities/event';
import { Media } from '../../../models/entities/media';

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

  constructor(private _route: ActivatedRoute, private _wpService: WpService, private _mediaService: MediaService, private _titleService: Title) {}

  ngOnInit(): void {
    this.getEvent();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getEvent(): void {
    const eventSubscription = this._route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug');
          return slug ? this._wpService.getEvent(slug) : of(null);
        }),
        switchMap((event) => {
          if (event) {
            this.initEvent(event);
            if(this.event.featuredMediaId === 0) return of(null);
            return this._wpService.getMediaById(this.event.featuredMediaId);
          } else {
            return of(null);
          }
        }),
        switchMap((featuredMedia) => {
          if (featuredMedia) {
            this.event.featuredMedia = this.initFeaturedMedia(featuredMedia);
            if(!this.event.galleryMediaIds) return of(null);
            return this._wpService.getMediaByIds(this.event.galleryMediaIds);
          } else {
            return of(null);
          }
        }),
        switchMap((galleryMedia) => {
          if (galleryMedia) {
            this.event.galleryMedia = this.initGalleryMedia(galleryMedia);
            return this._wpService.getNewsByEventId(this.event.id, 8);
          } else {
            return of(null);
          }
        }),
        tap((news) => {
          if (news && news.length > 0) {
            this.initNews(news);
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

    this._subscriptions.add(eventSubscription);
  }

  private initEvent(event: any): void {
    this.event = new Event();
    this.event.id = event.id;
    this.event.title = event.title.rendered;
    this.event.content = event.content.rendered;
    this.event.featuredMediaId = event.featured_media;
    this.event.galleryMediaIds = event.acf.gallery;
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

  private initNews(news: any[]): void {
    this.news = news.map((data) => {
      let news = new News();
      news.title = data.title.rendered;
      news.content = data.content.rendered;
      return news;
    });
  }

  private initTitle(): void {
    if (this.event.title) {
      this._titleService.setTitle(this.event.title + ' - ' + this._appTitle);
    } else {
      this._titleService.setTitle(this._appTitle);
    }
  }
}
