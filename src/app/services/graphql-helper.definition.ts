import { Event, Page, Post } from '../model/entity.definition';

export interface QueryResult<T> {
  data?: T;
  errors?: {
    message: string;
  }[];
}

export interface QueryEventsResult {
  events: {
    nodes: Event[];
  };
}

export interface QueryEventResult {
  event: Event | null;
}

export interface QueryPageResult {
  page: Page | null;
}

export interface QueryPostsResult {
  posts: {
    nodes: Post[];
  };
}

export interface QueryPostResult {
  post: Post | null;
}
