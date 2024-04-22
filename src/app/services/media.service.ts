import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  constructor() {}

  public mapMediaSize(media: any): any {
    const sizes = media.media_details.sizes;

    const thumbnail = sizes['thumbnail'] ? { src: sizes['thumbnail'].source_url } : undefined;
    const medium = sizes['medium'] ? { src: sizes['medium'].source_url } : thumbnail;
    const mediumLarge = sizes['medium_large'] ? { src: sizes['medium_large'].source_url } : medium;
    const large = sizes['large'] ? { src: sizes['large'].source_url } : mediumLarge;
    const xLarge = sizes['1536x1536'] ? { src: sizes['1536x1536'].source_url } : large;
    const xxLarge = sizes['2048x2048'] ? { src: sizes['2048x2048'].source_url } : xLarge;
    const full = sizes['full'] ? { src: sizes['full'].source_url } : xxLarge;

    return {
      thumbnail,
      medium,
      mediumLarge,
      large,
      xLarge,
      xxLarge,
      full,
    };
  }
}
