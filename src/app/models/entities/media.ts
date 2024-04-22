export class Media {
  id!: number;
  link!: string;
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
