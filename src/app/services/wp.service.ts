import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PageDefault } from '../models/entities/pageDefault';
import { Edition } from '../models/entities/edition';
import { News } from '../models/entities/news';
import { Event } from '../models/entities/event';
import { Media } from '../models/entities/media';
import { Category } from '../models/entities/category';

@Injectable({
  providedIn: 'root',
})
export class WpService {
  private _wpJsonBaseUrl = environment.wpJsonBaseUrl;
  private _customWpJsonBaseUrl = environment.customWpJsonBaseUrl;

  constructor(private _http: HttpClient) {}

  /**
   * Pages
   */

  getPageDefault(slug: string): Observable<PageDefault> {
    return this._http.get<PageDefault[]>(`${this._wpJsonBaseUrl}/pages?slug=${slug}`).pipe(map((pages) => pages[0] || null));
  }

  getPage(slug: string): Observable<PageDefault> {
    return this._http.get<PageDefault[]>(`${this._wpJsonBaseUrl}/pages?slug=${slug}`).pipe(map((pages) => pages[0] || null));
  }

  /**
   * Edition
   */

  getEditions(page: number, perPage: number): Observable<{ data: Edition[]; headers: HttpHeaders }> {
    return this._http
      .get<Edition[]>(`${this._wpJsonBaseUrl}/edition`, {
        params: {
          page: page.toString(),
          per_page: perPage.toString(),
        },
        observe: 'response',
      })
      .pipe(map(({ body, headers }) => ({ data: body as Edition[], headers })));
  }

  getEdition(slug: string): Observable<Edition> {
    return this._http.get<Edition[]>(`${this._wpJsonBaseUrl}/edition?slug=${slug}`).pipe(map((data) => data[0] || null));
  }

  getEventsByEditionId(editionId: number, postsPerPage: number = 10): Observable<Event[]> {
    return this._http.get<Event[]>(`${this._wpJsonBaseUrl}/event?edition_id=${editionId}&posts_per_page=${postsPerPage}`);
  }

  getNewsByEditionId(editionId: number, postsPerPage: number = 10): Observable<News[]> {
    return this._http.get<News[]>(`${this._wpJsonBaseUrl}/news?edition_id=${editionId}&posts_per_page=${postsPerPage}`);
  }

  /**
   * Event
   */

  getEvents(page: number, perPage: number): Observable<{ data: Event[]; headers: HttpHeaders }> {
    return this._http
      .get<Event[]>(`${this._wpJsonBaseUrl}/event`, {
        params: {
          page: page.toString(),
          per_page: perPage.toString(),
        },
        observe: 'response',
      })
      .pipe(map(({ body, headers }) => ({ data: body as Event[], headers })));
  }

  getEvent(slug: string): Observable<Event> {
    return this._http.get<Event[]>(`${this._wpJsonBaseUrl}/event?slug=${slug}`).pipe(map((data) => data[0] || null));
  }

  // Αν δεν υπάρχει link object θα τα φέρει όλα
  getNewsByEventId(eventId: number, postsPerPage: number = 10): Observable<News[]> {
    return this._http.get<News[]>(`${this._wpJsonBaseUrl}/news?event_id=${eventId}&posts_per_page=${postsPerPage}`);
  }

  /**
   * News
   */

  getNewsList(page: number, perPage: number): Observable<{ data: News[]; headers: HttpHeaders }> {
    return this._http
      .get<News[]>(`${this._wpJsonBaseUrl}/news`, {
        params: {
          page: page.toString(),
          per_page: perPage.toString(),
        },
        observe: 'response',
      })
      .pipe(map(({ body, headers }) => ({ data: body as News[], headers })));
  }

  getNews(slug: string): Observable<News> {
    return this._http.get<News[]>(`${this._wpJsonBaseUrl}/news?slug=${slug}`).pipe(map((data) => data[0] || null));
  }

  // Αν δεν υπάρχει link object θα τα φέρει όλα
  getEventsByNewsId(newsId: number, postsPerPage: number = 10): Observable<Event[]> {
    return this._http.get<Event[]>(`${this._wpJsonBaseUrl}/event?news_id=${newsId}&posts_per_page=${postsPerPage}`);
  }

  /**
   * Media
   */

  getMediaById(mediaId: number): Observable<Media> {
    return this._http.get<Media>(`${this._wpJsonBaseUrl}/media/${mediaId}`);
  }

  getMediaByIds(mediaIds: number[]): Observable<Media[]> {
    const idsParam = mediaIds.join(',');
    return this._http.get<Media[]>(`${this._wpJsonBaseUrl}/media?include=${idsParam}`);
  }

  /**
   * Taxonomies
   */

  // News

  getNewsCategoriesByPostId(id: number): Observable<Category[]> {
    return this._http.get<Category[]>(`${this._wpJsonBaseUrl}/news_category?post=${id}`);
  }

  getNewsCategory(slug: string): Observable<Category> {
    return this._http.get<Category[]>(`${this._wpJsonBaseUrl}/news_category?slug=${slug}`).pipe(map((data) => data[0] || null));
  }

  getNewsByNewsCategoriesIds(categoryIds: number[], page: number, perPage: number): Observable<{ news: News[]; headers: HttpHeaders }> {
    return this._http
      .get<News[]>(`${this._wpJsonBaseUrl}/news`, {
        params: {
          news_category: categoryIds.join(', '),
          page: page.toString(),
          per_page: perPage.toString(),
        },
        observe: 'response',
      })
      .pipe(map(({ body, headers }) => ({ news: body as News[], headers })));
  }

  // Events

  getEventCategoriesByPostId(id: number): Observable<Category[]> {
    return this._http.get<Category[]>(`${this._wpJsonBaseUrl}/event_category?post=${id}`);
  }

  getEventCategory(slug: string): Observable<Category> {
    return this._http.get<Category[]>(`${this._wpJsonBaseUrl}/event_category?slug=${slug}`).pipe(map((data) => data[0] || null));
  }

  getEventsByEventCategoriesIds(categoryIds: number[], page: number, perPage: number): Observable<{ events: Event[]; headers: HttpHeaders }> {
    return this._http
      .get<Event[]>(`${this._wpJsonBaseUrl}/event`, {
        params: {
          event_category: categoryIds.join(', '),
          page: page.toString(),
          per_page: perPage.toString(),
        },
        observe: 'response',
      })
      .pipe(map(({ body, headers }) => ({ events: body as Event[], headers })));
  }

  // Home

  getFeaturedNews(): Observable<News[]> {
    return this._http.get<News[]>(`${this._wpJsonBaseUrl}/featured-news/`);
  }

  // getFilteredNewsByNewsCategoriesIds(
  //   categoryIds: number[],
  //   excludeIds: number[],
  //   page: number,
  //   perPage: number
  // ): Observable<{ news: News[]; headers: HttpHeaders }> {
  //   return this._http
  //     .get<News[]>(`${this._wpJsonBaseUrl}/news`, {
  //       params: {
  //         news_category: categoryIds.join(','),
  //         exclude: excludeIds.join(','),
  //         page: page.toString(),
  //         per_page: perPage.toString(),
  //       },
  //       observe: 'response',
  //     })
  //     .pipe(map(({ body, headers }) => ({ news: body as News[], headers })));
  // }

  getFilteredNewsByNewsCategoriesIds(categoryIds: number[], excludedPostsIds: number[], page: number, perPage: number): Observable<News[]> {
    return this._http.get<News[]>(`${this._wpJsonBaseUrl}/news`, {
      params: {
        news_category: categoryIds.join(','),
        exclude: excludedPostsIds.join(','),
        page: page.toString(),
        per_page: perPage.toString(),
      },
    });
  }
}
