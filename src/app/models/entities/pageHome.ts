import { Page } from './page';

export class PageHome extends Page {
  author!: string;
  publishDate!: Date;
  tags!: string[];

  constructor() {
    super();
  }
}
