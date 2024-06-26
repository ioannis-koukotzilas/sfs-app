import { Component } from '@angular/core';
import { Subscription, concatMap, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { News } from '../../../models/entities/news';
import { Event } from '../../../models/entities/event';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { Media } from '../../../models/entities/media';
import { PageHome } from '../../../models/entities/pageHome';
import { CoverImage } from '../../../models/entities/cover';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MetaService } from '../../../services/meta.service';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrl: './page-home.component.css',
})
export class PageHomeComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  page!: PageHome;

  featuredNews: News[] = [];
  analysisNews: News[] = [];
  observatoryNews: News[] = [];
  featuredEvents: Event[] = [];

  coverImage?: CoverImage;

  showMainNavigation = false;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _loadingService: LoadingService,
    private _breakpointObserver: BreakpointObserver,
    private _titleService: Title,
    private _metaService: MetaService
  ) {}

  ngOnInit(): void {
    this.getPage();
    this.initBreakpointObserver();
  }

  public initBreakpointObserver() {
    const sub = this._breakpointObserver.observe(['(min-width: 1280px)']).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.showMainNavigation = true;
      } else {
        this.showMainNavigation = false;
      }
    });

    this._subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this._metaService.removeAll();
    this._subscriptions.unsubscribe();
  }

  private getPage(): void {
    const sub = this._route.data
      .pipe(
        concatMap(({ page }) => {
          if (page) {
            this.initPage(page);

            if (this.page.featuredMediaId && this.page.featuredMediaId > 0) {
              return this._wpService.getMediaById(this.page.featuredMediaId);
            } else {
              return of(null);
            }
          }

          return of(null);
        }),
        tap((featuredMedia) => {
          if (featuredMedia) {
            this.page.featuredMedia = this.initFeaturedMedia(featuredMedia);
            this.initCoverImage();
          }
        })
      )
      .subscribe({
        next: () => {
          this.getFeaturedNews();
        },
        error: (error) => {
          console.error('Error:', error);
          this._loadingService.set(false);
        },
      });

    this._subscriptions.add(sub);
  }

  private getFeaturedNews(): void {
    const analysisCategoryId = 6;
    const justiceCategoryId = 10;
    const actionsCategoryId = 13;

    const observatoryCategoryId = 9;

    let featuredNewsIds: number[];
    const sub = this._wpService
      .getFeaturedNews()
      .pipe(
        tap((featuredNews) => {
          if (featuredNews) {
            this.featuredNews = this.initNews(featuredNews);
          } else {
            throw new Error('No featured news found');
          }
        }),
        concatMap(() => {
          if (this.featuredNews && this.featuredNews.length > 0) {
            featuredNewsIds = this.featuredNews.map((x) => x.id);
            const featuredNewsMediaIds = this.featuredNews.map((x) => x.featuredMediaId).filter((id) => id !== null);
            if (featuredNewsMediaIds && featuredNewsMediaIds.length > 0) {
              return this._wpService.getMediaByIds(featuredNewsMediaIds);
            } else {
              return of([]);
            }
          }
          return of([]);
        }),
        concatMap((featuredNewsMedia) => {
          if (featuredNewsMedia && featuredNewsMedia.length > 0) {
            this.mapFeaturedNewsMedia(featuredNewsMedia);
          }

          return this._wpService.getFilteredNewsByNewsCategoriesIds([analysisCategoryId, justiceCategoryId, actionsCategoryId], featuredNewsIds, 1, 4);
        }),
        concatMap((analysisNews) => {
          if (analysisNews && analysisNews.length > 0) {
            this.analysisNews = this.initNews(analysisNews);
            const analysisNewsMediaIds = this.analysisNews.map((x) => x.featuredMediaId).filter((id) => id !== null);
            if (analysisNewsMediaIds && analysisNewsMediaIds.length > 0) {
              return this._wpService.getMediaByIds(analysisNewsMediaIds);
            } else {
              return of([]);
            }
          }
          return of([]);
        }),
        concatMap((analysisNewsMedia) => {
          if (analysisNewsMedia && analysisNewsMedia.length > 0) {
            this.mapAnalysisNewsMedia(analysisNewsMedia);
          }

          return this._wpService.getFilteredNewsByNewsCategoriesIds([observatoryCategoryId], featuredNewsIds, 1, 4);
        }),
        concatMap((observatoryNews) => {
          if (observatoryNews && observatoryNews.length > 0) {
            this.observatoryNews = this.initNews(observatoryNews);
            const observatoryNewsMediaIds = this.observatoryNews.map((x) => x.featuredMediaId).filter((id) => id !== null);
            if (observatoryNewsMediaIds && observatoryNewsMediaIds.length > 0) {
              return this._wpService.getMediaByIds(observatoryNewsMediaIds);
            } else {
              return of([]);
            }
          }
          return of([]);
        }),
        concatMap((observatoryNewsMedia) => {
          if (observatoryNewsMedia && observatoryNewsMedia.length > 0) {
            this.mapObservatoryNewsMedia(observatoryNewsMedia);
          }

          return this._wpService.getFilteredEvents(featuredNewsIds, 1, 4);
        }),
        concatMap((featuredEvents) => {
          if (featuredEvents && featuredEvents.length > 0) {
            this.featuredEvents = this.initEvents(featuredEvents);
            const featuredEventsMediaIds = this.featuredEvents.map((x) => x.featuredMediaId).filter((id) => id !== null);
            if (featuredEventsMediaIds && featuredEventsMediaIds.length > 0) {
              return this._wpService.getMediaByIds(featuredEventsMediaIds);
            } else {
              return of([]);
            }
          }
          return of([]);
        }),
        tap((featuredEventsMedia) => {
          if (featuredEventsMedia && featuredEventsMedia.length > 0) {
            this.mapFeaturedEventsMedia(featuredEventsMedia);
          }
        })
      )
      .subscribe({
        next: () => {
          this._loadingService.set(false);
          this.initTitle();
          this.initMetaData();
        },
        error: (error) => {
          console.error('Error:', error);
          this._loadingService.set(false);
        },
      });

    this._subscriptions.add(sub);
  }

  private initPage(page: any): void {
    this.page = new PageHome();
    this.page.title = page.title.rendered;
    this.page.content = page.content.rendered;
    this.page.featuredMediaId = page.featured_media;
    this.page.coverTitle = page.acf.cover_title;
    this.page.coverLinkSlug = page.cover_link_info?.slug ?? null;
    this.page.coverLinkPostType = page.cover_link_info?.post_type ?? null;
  }

  private initCoverImage(): void {
    this.coverImage = new CoverImage();
    this.coverImage.media = this.page.featuredMedia;
    this.coverImage.showTitle = true;
    this.coverImage.title = this.page.coverTitle;
    this.coverImage.linkSlug = this.page.coverLinkSlug;
    this.coverImage.linkPostType = this.page.coverLinkPostType;
  }

  private initNews(data: any[]): News[] {
    const news = data.map((item) => {
      let newsItem = new News();
      newsItem.id = item.id;
      newsItem.slug = item.slug;
      newsItem.date = item.date;
      newsItem.title = item.title.rendered;
      newsItem.excerpt = item.excerpt.rendered;
      newsItem.featuredMediaId = item.featured_media;
      return newsItem;
    });

    return news;
  }

  private initEvents(data: any[]): Event[] {
    const events = data.map((item) => {
      let event = new Event();
      event.id = item.id;
      event.slug = item.slug;
      event.date = item.date;
      event.title = item.title.rendered;
      event.excerpt = item.excerpt.rendered;
      event.featuredMediaId = item.featured_media;
      return event;
    });

    return events;
  }

  private mapFeaturedNewsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      this.featuredNews
        .filter((x) => x.featuredMediaId === mediaItem.id)
        .forEach((item) => {
          item.featuredMedia = this.initFeaturedMedia(mediaItem);
        });
    });
  }

  private mapAnalysisNewsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      this.analysisNews
        .filter((x) => x.featuredMediaId === mediaItem.id)
        .forEach((item) => {
          item.featuredMedia = this.initFeaturedMedia(mediaItem);
        });
    });
  }

  private mapObservatoryNewsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      this.observatoryNews
        .filter((x) => x.featuredMediaId === mediaItem.id)
        .forEach((item) => {
          item.featuredMedia = this.initFeaturedMedia(mediaItem);
        });
    });
  }

  private mapFeaturedEventsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      this.featuredEvents
        .filter((x) => x.featuredMediaId === mediaItem.id)
        .forEach((item) => {
          item.featuredMedia = this.initFeaturedMedia(mediaItem);
        });
    });
  }

  private initFeaturedMedia(media: any): Media {
    let featuredMedia = new Media();
    featuredMedia.id = media.id;
    featuredMedia.link = media.link;
    featuredMedia.altText = media.alt_text;
    featuredMedia.caption = media.caption.rendered;
    featuredMedia.size = this._mediaService.mapMediaSize(media);

    return featuredMedia;
  }

  private initTitle(): void {
    this._titleService.setTitle(this._appTitle ?? '');
  }

  private initMetaData(): void {
    this._metaService.updateBaseTitle(this._appTitle);
    // this._metaService.updateBaseDescription(this._metaService.formatDescription(this.page.content));
    this._metaService.updateUrl(environment.baseUrl + this._router.url);
    this._metaService.updateTitle(this._appTitle);
    // this._metaService.updateDescription(this._metaService.formatDescription(this.page.content));
    this._metaService.updateImage(this.page?.featuredMedia?.size?.xLarge?.src ?? '');
  }
}
