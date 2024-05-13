export class Media {
  id!: number;
  link!: string;
  altText!: string;
  caption!: string;
  size!: {
    thumbnail?: MediaSize;
    medium?: MediaSize;
    mediumLarge?: MediaSize;
    large?: MediaSize;
    xLarge?: MediaSize;
    xxLarge?: MediaSize;
    full?: MediaSize;
  };
}

export class MediaSize {
  src!: string;
}
