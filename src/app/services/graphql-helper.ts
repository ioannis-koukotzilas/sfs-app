import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  QueryEventResult,
  QueryEventsResult,
  QueryPageResult,
  QueryPostResult,
  QueryPostsResult,
  QueryResult,
} from './graphql-helper.definition';
import { map, Observable } from 'rxjs';
import { QUERY_EVENT, QUERY_EVENTS, QUERY_PAGE, QUERY_POST, QUERY_POSTS } from '../graphql/queries';
import { Event, Page, Post } from '../model/entity.definition';

@Service()
export class GraphQLHelper {
  private graphEndpoint = environment.graphqlEndpoint;

  private httpClient = inject(HttpClient);

  queryEvents(): Observable<Event[]> {
    return this.httpClient
      .post<QueryResult<QueryEventsResult>>(this.graphEndpoint, {
        query: QUERY_EVENTS,
      })
      .pipe(
        map((response) => {
          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }

          const events = response.data?.events.nodes ?? [];
          return events.map((event) => this.mapEvent(event));
        }),
      );
  }

  queryEvent(slug: string): Observable<Event | null> {
    return this.httpClient
      .post<QueryResult<QueryEventResult>>(this.graphEndpoint, {
        query: QUERY_EVENT,
        variables: { slug },
      })
      .pipe(
        map((response) => {
          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }

          const event = response.data?.event ?? null;
          return event ? this.mapEvent(event) : null;
        }),
      );
  }

  queryPage(slug: string): Observable<Page | null> {
    const uri = `/${slug}`;

    return this.httpClient
      .post<QueryResult<QueryPageResult>>(this.graphEndpoint, {
        query: QUERY_PAGE,
        variables: { uri },
      })
      .pipe(
        map((response) => {
          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }

          const page = response.data?.page ?? null;
          return page ? this.mapPage(page) : null;
        }),
      );
  }

  queryPosts(): Observable<Post[]> {
    return this.httpClient
      .post<QueryResult<QueryPostsResult>>(this.graphEndpoint, {
        query: QUERY_POSTS,
      })
      .pipe(
        map((response) => {
          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }

          const posts = response.data?.posts.nodes ?? [];
          return posts.map((post) => this.mapPost(post));
        }),
      );
  }

  queryPost(slug: string): Observable<Post | null> {
    return this.httpClient
      .post<QueryResult<QueryPostResult>>(this.graphEndpoint, {
        query: QUERY_POST,
        variables: { slug },
      })
      .pipe(
        map((response) => {
          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }

          const post = response.data?.post ?? null;
          return post ? this.mapPost(post) : null;
        }),
      );
  }

  private mapEvent(event: any): Event {
    return {
      databaseId: event.databaseId,
      slug: event.slug,
      title: event.title,
      content: event.content,
      eventDate: event.eventFields?.eventDate ?? null,
      featuredImage: event.featuredImage?.node ?? null,
      categories: event.categories?.nodes ?? [],
    };
  }

  private mapPage(page: any): Page {
    return {
      databaseId: page.databaseId,
      slug: page.slug,
      title: page.title,
      content: page.content,
      featuredImage: page.featuredImage?.node ?? null,
      gallery: page.pageFields.gallery?.nodes ?? []
    };
  }

  private mapPost(post: any): Post {
    return {
      databaseId: post.databaseId,
      slug: post.slug,
      date: post.date,
      title: post.title,
      content: post.content,
      featuredImage: post.featuredImage?.node ?? null,
      categories: post.categories?.nodes ?? [],
    };
  }
}
