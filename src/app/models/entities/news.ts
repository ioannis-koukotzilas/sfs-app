import { Media } from "./media";

export class News {
  id!: number;
  slug!: string;
  date!: string;
  title!: string;
  content!: string;
  excerpt!: string;
  featuredMediaId!: number;
  featuredMedia?: Media;
  galleryMediaIds!: number[];
  galleryMedia?: Media[];
}