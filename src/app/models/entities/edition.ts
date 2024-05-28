import { Media } from './media';

export class Edition {
  id!: number;
  slug!: string;
  title!: string;
  content!: string;
  excerpt!: string;
  featuredMediaId!: number;
  featuredMedia?: Media;
  galleryMediaIds!: number[];
  galleryMedia?: Media[];

  coverTitle!: string;
  coverLinkSlug!: string;
  coverLinkPostType!: string;
}
