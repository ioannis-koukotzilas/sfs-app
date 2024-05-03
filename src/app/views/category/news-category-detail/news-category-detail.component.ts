import { Component } from '@angular/core';
import { Observable, Subscription, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../models/entities/category';
import { ActivatedRoute, Router } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { MediaService } from '../../../services/media.service';
import { Title } from '@angular/platform-browser';
import { News } from '../../../models/entities/news';
import { Media } from '../../../models/entities/media';

@Component({
  selector: 'app-news-category-detail',
  templateUrl: './news-category-detail.component.html',
  styleUrl: './news-category-detail.component.css',
})
export class NewsCategoryDetailComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  loading = false;

  category!: Category;

  news?: News[];

  currentPage: number = 1;
  perPage: number = 1;
  totalPages: number = 0;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _wpService: WpService,
    private _mediaService: MediaService,
    private _titleService: Title
  ) {}

  ngOnInit(): void {
    const routeSubscription = this._route.paramMap.subscribe(() => {
      this.getCategory();
    });

    this._subscriptions.add(routeSubscription);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private checkRouteParams(): Observable<{ category: Category | null; page: number }> {
    return this._route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        const page = Number(params.get('page')) || 1;

        if (slug) {
          return this._wpService.getCategory(slug).pipe(map((category) => ({ category, page })));
        } else {
          return of({ category: null, page });
        }
      })
    );
  }

  private getCategory(): void {
    this.loading = true;
    const routeParamsSubscription = this.checkRouteParams()
      .pipe(
        tap(({ category, page }) => {
          if (category) {
            // if (this.category.id !== category.id) {
            //   this.initCategory(category);
            // }

            this.initCategory(category);

            if (this.currentPage !== page) {
              this.currentPage = page;
            }
          } else {
            throw new Error('No category found');
          }
        }),
        switchMap(({ category, page }) => {
          return this._wpService.getNewsByCategoryIds([this.category.id], page, this.perPage);
        }),
        switchMap(({ news, headers }) => {
          if (news && news.length > 0) {
            this.news = [];
            this.category.news = this.initNews(news);
            this.totalPages = Number(headers.get('X-WP-TotalPages'));
            const mediaIds = news.map((x) => x.featuredMediaId).filter((id) => id !== null);
            return this._wpService.getMediaByIds(mediaIds);
          } else {
            return of([]);
          }
        }),
        tap((newsFeaturedMedia) => {
          if (newsFeaturedMedia && newsFeaturedMedia.length > 0) {
            this.mapNewsMedia(newsFeaturedMedia);
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

  onPageChange(page: number): void {
    this._router.navigate([`/news/category/${this.category.slug}/page`, page]);
  }

  private initCategory(category: any): void {
    this.category = new Category();
    this.category.id = category.id;
    this.category.slug = category.slug;
    this.category.name = category.name;
    this.category.description = category.description;
    this.category.parent = category.parent;
  }

  private initNews(newsArr: any[]): News[] {
    this.news = newsArr.map((data) => {
      let newsItem = new News();
      newsItem.slug = data.slug;
      newsItem.date = data.date;
      newsItem.title = data.title.rendered;
      newsItem.excerpt = data.excerpt.rendered;
      newsItem.featuredMediaId = data.featured_media;
      return newsItem;
    });

    return this.news;
  }

  private mapNewsMedia(media: any[]): void {
    media.forEach((mediaItem) => {
      const newsItem = this.news?.find((x) => x.featuredMediaId === mediaItem.id);
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
