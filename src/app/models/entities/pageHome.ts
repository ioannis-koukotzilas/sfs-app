import { Page } from './page';

export class PageHome extends Page {
  coverTitle!: string;
  coverLinkSlug!: string;
  coverLinkPostType!: string;

  constructor() {
    super();
  }
}
