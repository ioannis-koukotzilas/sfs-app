import { HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { WpService } from '../../../services/wp.service';
import { Event } from '../../../models/entities/event';

export const eventListResolver: ResolveFn<{ events: Event[]; headers: HttpHeaders; currentPage: Number }> = (route) => {
  const currentPage = +route.params['page'];
  const perPage = 4;

  return inject(WpService)
    .getEvents(currentPage, perPage)
    .pipe(map((data) => ({ events: data.events, headers: data.headers, currentPage: currentPage })));
};
