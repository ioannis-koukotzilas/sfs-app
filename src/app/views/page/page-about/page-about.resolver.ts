import { ResolveFn } from '@angular/router';
import { PageDefault } from '../../../models/entities/pageDefault';
import { inject } from '@angular/core';
import { WpService } from '../../../services/wp.service';

export const pageAboutResolver: ResolveFn<PageDefault> = (route) => {
  return inject(WpService).getPage('about');
};
