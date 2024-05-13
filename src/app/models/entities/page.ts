import { Media } from "./media";

export class Page {
  id!: number;
  title!: string;
  content!: string;
  featuredMediaId!: number;
  featuredMedia?: Media;
}
