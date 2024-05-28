import { ResolveFn } from '@angular/router';
import { Edition } from '../../../models/entities/edition';
import { inject } from '@angular/core';
import { WpService } from '../../../services/wp.service';

export const editionDetailResolver: ResolveFn<Edition> = (route) => {
  const slug = route.params['slug'];

  return inject(WpService).getEdition(slug);
};
