import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { PageDefault } from '../../../models/entities/pageDefault';

export const pageHomeResolver: ResolveFn<PageDefault> = (route, state) => {
  return inject(WpService).getPage('home');
};
