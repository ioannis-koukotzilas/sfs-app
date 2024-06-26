import { Category } from "./category";
import { Media } from "./media";

export class Event {
  id!: number;
  slug!: string;
  date!: string;
  title!: string;
  content!: string;
  excerpt!: string;
  featuredMediaId!: number;
  featuredMedia?: Media;
  categoryIds!: number[];
  categories?: Category[];
  galleryMediaIds!: number[];
  galleryMedia?: Media[];
  relatedEvents?: Event[];
}
