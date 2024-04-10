import { Media } from './media';

export class Edition {
  id!: number;
  slug!: string;
  title!: string;
  content!: string;
  featuredMediaId!: number;
  featuredMedia?: Media;
  galleryMediaIds!: number[];
  galleryMedia?: Media[];
}
