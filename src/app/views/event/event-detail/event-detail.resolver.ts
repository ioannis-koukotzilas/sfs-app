import { ResolveFn } from '@angular/router';
import { Event } from '../../../models/entities/event';
import { inject } from '@angular/core';
import { WpService } from '../../../services/wp.service';

export const eventDetailResolver: ResolveFn<Event> = (route) => {
  const slug = route.params['slug'];

  return inject(WpService).getEvent(slug);
};
