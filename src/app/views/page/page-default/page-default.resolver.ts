import { ResolveFn } from '@angular/router';
import { PageDefault } from '../../../models/entities/pageDefault';
import { inject } from '@angular/core';
import { WpService } from '../../../services/wp.service';

export const pageDefaultResolver: ResolveFn<PageDefault> = (route) => {
  const slug = route.params['slug'];

  return inject(WpService).getPage(slug);
};
