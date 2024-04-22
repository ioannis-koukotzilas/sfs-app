import { News } from './news';
import { Event } from './event';

export class Category {
  id!: number;
  slug!: string;
  name!: string;
  description!: string;
  parent!: number;
  news?: News[];
  events?: Event[];
}
