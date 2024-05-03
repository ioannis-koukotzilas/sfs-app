import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { WpService } from '../../../services/wp.service';
import { Edition } from '../../../models/entities/edition';
import { Subscription, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Media } from '../../../models/entities/media';
import { MediaService } from '../../../services/media.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edition-list',
  templateUrl: './edition-list.component.html',
  styleUrl: './edition-list.component.css',
})
export class EditionListComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  loading = false;

  editions: Edition[] = [];

  currentPage: number = 1;
  perPage: number = 2;
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
      this.getEditions(this.currentPage, this.perPage);
    });

    this._subscriptions.add(routeParamsSubscription);
  }

  private getEditions(page: number, perPage: number): void {
    this.loading = true;
    const getEditionsSubscription = this._wpService
      .getEditions(page, perPage)
      .pipe(
        switchMap(({ data, headers }) => {
          if (data && data.length > 0) {
            this.editions = [];
            this.initEditions(data);
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

    this._subscriptions.add(getEditionsSubscription);
  }

  onPageChange(page: number): void {
    this._router.navigate(['/editions/page', page]);
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
