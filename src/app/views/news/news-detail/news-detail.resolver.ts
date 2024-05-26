import { ResolveFn } from '@angular/router';
import { News } from '../../../models/entities/news';
import { WpService } from '../../../services/wp.service';
import { inject } from '@angular/core';

export const newsDetailResolver: ResolveFn<News> = (route) => {
  const slug = route.params['slug'];

  return inject(WpService).getNews(slug);
};