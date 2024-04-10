import { Component, OnDestroy, OnInit } from '@angular/core';
import { Edition } from '../../../models/entities/edition';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { Title } from '@angular/platform-browser';
import { Subscription, of, switchMap, tap } from 'rxjs';
import { News } from '../../../models/entities/news';
import { Event } from '../../../models/entities/event';
import { environment } from '../../../../environments/environment';
import { Media } from '../../../models/entities/media';
import { MediaService } from '../../../services/media.service';

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

  constructor(private _route: ActivatedRoute, private _wpService: WpService, private _mediaService: MediaService, private _titleService: Title) {}

  ngOnInit(): void {
    this.getEdition();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getEdition(): void {
    const editionSubscription = this._route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug');
          return slug ? this._wpService.getEdition(slug) : of(null);
        }),
        switchMap((edition) => {
          if (edition) {
            this.initEdition(edition);
            return this._wpService.getMediaById(this.edition.featuredMediaId);
          } else {
            return of(null);
          }
        }),
        switchMap((featuredMedia) => {
          if (featuredMedia) {
            this.edition.featuredMedia = this.initFeaturedMedia(featuredMedia);
            return this._wpService.getMediaByIds(this.edition.galleryMediaIds);
          } else {
            return of(null);
          }
        }),
        switchMap((galleryMedia) => {
          if (galleryMedia) {
            this.edition.galleryMedia = this.initGalleryMedia(galleryMedia);
            return this._wpService.getEventsByEditionId(this.edition.id, 8);
          } else {
            return of(null);
          }
        }),
        switchMap((events) => {
          if (events && events.length > 0) {
            this.initEvents(events);
            return this._wpService.getNewsByEditionId(this.edition.id, 8);
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

    this._subscriptions.add(editionSubscription);
  }

  private initEdition(edition: any): void {
    this.edition = new Edition();
    this.edition.id = edition.id;
    this.edition.title = edition.title.rendered;
    this.edition.content = edition.content.rendered;
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
      return event;
    });
  }

  private initNews(news: any[]): void {
    this.news = news.map((data) => {
      let news = new News();
      news.slug = data.slug;
      news.date = data.date;
      news.title = data.title.rendered;
      news.excerpt = data.excerpt.rendered;
      return news;
    });
  }

  private initTitle(): void {
    if (this.edition.title) {
      this._titleService.setTitle(this.edition.title + ' - ' + this._appTitle);
    } else {
      this._titleService.setTitle(this._appTitle);
    }
  }
}
