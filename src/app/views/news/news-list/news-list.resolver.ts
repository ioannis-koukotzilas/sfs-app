import { ResolveFn } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { inject } from '@angular/core';
import { News } from '../../../models/entities/news';
import { HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';

export const newsListResolver: ResolveFn<{ news: News[]; headers: HttpHeaders; currentPage: Number }> = (route) => {
  const currentPage = +route.params['page'];
  const perPage = 4;

  return inject(WpService)
    .getNewsList(currentPage, perPage)
    .pipe(map((data) => ({ news: data.news, headers: data.headers, currentPage: currentPage })));
};
