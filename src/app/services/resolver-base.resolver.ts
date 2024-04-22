import { ResolveFn } from '@angular/router';

export const resolverBaseResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
