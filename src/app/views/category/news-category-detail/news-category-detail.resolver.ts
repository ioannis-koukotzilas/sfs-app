import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { WpService } from '../../../services/wp.service';
import { Category } from '../../../models/entities/category';
import { map } from 'rxjs';

export const newsCategoryDetailResolver: ResolveFn<{ category: Category; currentPage: number }> = (route) => {
  const slug = route.params['slug'];
  const currentPage = +route.params['page'];

  return inject(WpService)
    .getNewsCategory(slug)
    .pipe(map((data) => ({ category: data, currentPage: currentPage })));
};
