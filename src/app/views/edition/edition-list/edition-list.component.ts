import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { WpService } from '../../../services/wp.service';
import { Edition } from '../../../models/entities/edition';
import { Subscription, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Media } from '../../../models/entities/media';
import { MediaService } from '../../../services/media.service';

@Component({
  selector: 'app-edition-list',
  templateUrl: './edition-list.component.html',
  styleUrl: './edition-list.component.css',
})
export class EditionListComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  editions: Edition[] = [];

  page: number = 1;
  perPage: number = 1;
  hasMore = true;

  constructor(private _wpService: WpService, private _mediaService: MediaService, private _titleService: Title) {}

  ngOnInit(): void {
    this.getEditions(this.page, this.perPage);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getEditions(page: number, perPage: number): void {
    const editionsSubscription = this._wpService
      .getEditions(page, perPage)
      .pipe(
        switchMap(({ data, headers }) => {
          if (data && data.length > 0) {
            this.initEditions(data);
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

      this._subscriptions.add(editionsSubscription);
  }

  loadMore(): void {
    this.page += 1;
    this.getEditions(this.page, this.perPage);
  }

  private initEditions(editions: any[]): void {
    const mappedEditions = editions.map((data) => {
      let edition = new Edition();
      edition.slug = data.slug;
      edition.title = data.title.rendered;
      edition.content = data.content.rendered;
      edition.featuredMediaId = data.featured_media;
      return edition;
    });

    this.editions = [...this.editions, ...mappedEditions];
  }

  private mapMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const edition = this.editions.find((x) => x.featuredMediaId === mediaItem.id);
      if (edition) {
        edition.featuredMedia = this.initFeaturedMedia(mediaItem);
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
