import { ResolveFn } from '@angular/router';
import { Edition } from '../../../models/entities/edition';
import { HttpHeaders } from '@angular/common/http';
import { WpService } from '../../../services/wp.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const editionListResolver: ResolveFn<{ editions: Edition[]; headers: HttpHeaders; currentPage: number }> = (route) => {
  const currentPage = +route.params['page'];
  const perPage = 4;

  return inject(WpService)
    .getEditions(currentPage, perPage)
    .pipe(map((data) => ({ editions: data.editions, headers: data.headers, currentPage: currentPage })));
};
