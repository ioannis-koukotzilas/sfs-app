export class Media {
  id!: number;
  link!: string;
  size!: {
    medium?: MediaSize;
    large?: MediaSize;
    thumbnail?: MediaSize;
    mediumLarge?: MediaSize;
    full?: MediaSize;
  };
}

export class MediaSize {
  source!: string;
}
