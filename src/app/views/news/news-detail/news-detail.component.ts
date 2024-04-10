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
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css',
})
export class NewsDetailComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  news!: News;
  events!: Event[];

  constructor(private _route: ActivatedRoute, private _wpService: WpService, private _mediaService: MediaService, private _titleService: Title) {}

  ngOnInit(): void {
    this.getNews();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getNews(): void {
    const newsSubscription = this._route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug');
          return slug ? this._wpService.getNews(slug) : of(null);
        }),
        switchMap((news) => {
          if (news) {
            this.initNews(news);
            if(this.news.featuredMediaId === 0) return of(null);
            return this._wpService.getMediaById(this.news.featuredMediaId);
          } else {
            return of(null);
          }
        }),
        switchMap((featuredMedia) => {
          if (featuredMedia) {
            this.news.featuredMedia = this.initFeaturedMedia(featuredMedia);
            if(!this.news.galleryMediaIds) return of(null);
            return this._wpService.getMediaByIds(this.news.galleryMediaIds);
          } else {
            return of(null);
          }
        }),
        switchMap((galleryMedia) => {
          if (galleryMedia) {
            this.news.galleryMedia = this.initGalleryMedia(galleryMedia);
            return this._wpService.getEventsByEditionId(this.news.id, 8);
          } else {
            return of(null);
          }
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
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });

    this._subscriptions.add(newsSubscription);
  }

  private initNews(news: any): void {
    this.news = new News();
    this.news.id = news.id;
    this.news.title = news.title.rendered;
    this.news.content = news.content.rendered;
    this.news.featuredMediaId = news.featured_media;
    this.news.galleryMediaIds = news.acf.gallery;
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
      event.title = data.title.rendered;
      event.content = data.content.rendered;
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
}
