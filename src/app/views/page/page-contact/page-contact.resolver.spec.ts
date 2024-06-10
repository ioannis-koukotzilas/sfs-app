import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { pageContactResolver } from './page-contact.resolver';

describe('pageContactResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => pageContactResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
