import { Component, ComponentRef } from '@angular/core';
import { Subscription, concatMap, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { News } from '../../../models/entities/news';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { Page } from '../../../models/entities/page';
import { Media } from '../../../models/entities/media';
import { ViewContainerRefService } from '../../../services/view-container-ref.service';
import { DynamicContentService } from '../../../services/dynamic-content.service';
import { CoverImageComponent } from '../../../shared-views/cover-image/cover-image.component';
import { PageHome } from '../../../models/entities/pageHome';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrl: './page-home.component.css',
})
export class PageHomeComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  loading = false;

  page!: PageHome;

  featuredNews: News[] = [];
  analysisNews: News[] = [];

  constructor(
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _titleService: Title,
    private _viewContainerRefService: ViewContainerRefService,
    private _dynamicContentService: DynamicContentService
  ) {}

  ngOnInit(): void {
    this.getPage();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();

    const hostViewContainerRef = this._viewContainerRefService.getHostViewContainerRef();
    if (hostViewContainerRef) {
      hostViewContainerRef.clear();
    }
  }

  private getPage(): void {
    this.loading = true;
    const slug = 'home';
    const sub = this._wpService
      .getPage(slug)
      .pipe(
        concatMap((page) => {
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

            const hostViewContainerRef = this._viewContainerRefService.getHostViewContainerRef();
            if (hostViewContainerRef) {
              const compRef = this._dynamicContentService.loadComponent(hostViewContainerRef, CoverImageComponent);
              this.initCover(compRef);
            }
          }
        })
      )

      .subscribe({
        next: () => {
          this.getFeaturedNews();
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
        },
      });

    this._subscriptions.add(sub);
  }

  private getFeaturedNews(): void {
    const analysisCategoryId = 6;
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

          return this._wpService.getFilteredNewsByNewsCategoriesIds([analysisCategoryId], featuredNewsIds, 1, 4);
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
        tap((analysisNewsMedia) => {
          if (analysisNewsMedia && analysisNewsMedia.length > 0) {
            this.mapAnalysisNewsMedia(analysisNewsMedia);
          }

          // return this._wpService.getFilteredNewsByNewsCategoriesIds([analysisCategoryId], featuredNewsIds, 1, 10);
        })
      )

      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
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
    this.page.coverLinkSlug = page.cover_link_info.slug;
    this.page.coverLinkPostType = page.cover_link_info.post_type;
  }

  private initCover(compRef: ComponentRef<CoverImageComponent>): void {
    compRef.instance.media = this.page.featuredMedia;
    compRef.instance.showCoverTitle = true;
    compRef.instance.coverTitle = this.page.coverTitle;
    compRef.instance.coverLinkSlug = this.page.coverLinkSlug;
    compRef.instance.coverLinkPostType = this.page.coverLinkPostType;
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

  private initFeaturedMedia(media: any): Media {
    let featuredMedia = new Media();
    featuredMedia.id = media.id;
    featuredMedia.link = media.link;
    featuredMedia.altText = media.alt_text;
    featuredMedia.caption = media.caption.rendered;
    featuredMedia.size = this._mediaService.mapMediaSize(media);

    return featuredMedia;
  }
}
