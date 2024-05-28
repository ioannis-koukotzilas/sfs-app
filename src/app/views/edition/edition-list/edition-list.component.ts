import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { WpService } from '../../../services/wp.service';
import { Edition } from '../../../models/entities/edition';
import { Subscription, concatMap, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Media } from '../../../models/entities/media';
import { MediaService } from '../../../services/media.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-edition-list',
  templateUrl: './edition-list.component.html',
  styleUrl: './edition-list.component.css',
})
export class EditionListComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  editions: Edition[] = [];

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
    this.getEditions();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private getEditions(): void {
    const sub = this._route.data
      .pipe(
        concatMap(({ data }) => {
          if (data.editions && data.editions.length > 0) {
            this.editions = [];
            this._viewportScroller.scrollToPosition([0, 0]);
            this.currentPage = data.currentPage;
            this.totalPages = Number(data.headers.get('X-WP-TotalPages'));
            this.initEditions(data.editions);
            const mediaIds = this.editions.map((x) => x.featuredMediaId).filter((id) => id !== null);
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

  private initEditions(editions: any[]): void {
    const mappedEditions = editions.map((data) => {
      let edition = new Edition();
      edition.slug = data.slug;
      edition.title = data.title.rendered;
      edition.content = data.content.rendered;
      edition.excerpt = data.excerpt.rendered;
      edition.featuredMediaId = data.featured_media;
      return edition;
    });

    this.editions = [...this.editions, ...mappedEditions];
  }

  private mapMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      this.editions
        .filter((x) => x.featuredMediaId === mediaItem.id)
        .forEach((edition) => {
          edition.featuredMedia = this.initFeaturedMedia(mediaItem);
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
    this._titleService.setTitle('Δεκαήμερο Αγώνα' + ' - ' + this._appTitle);
  }

  onPageChange(page: number): void {
    this._router.navigate(['/editions/page', page]);
  }
}
