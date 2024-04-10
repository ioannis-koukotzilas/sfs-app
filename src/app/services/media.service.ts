import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  constructor() {}

  public mapMediaSize(media: any): any {
    return {
      thumbnail: media.media_details.sizes.thumbnail ? { source: media.media_details.sizes.thumbnail.source_url } : undefined,
      medium: media.media_details.sizes.medium ? { source: media.media_details.sizes.medium.source_url } : undefined,
      mediumLarge: media.media_details.sizes.medium_large ? { source: media.media_details.sizes.medium_large.source_url } : undefined,
      large: media.media_details.sizes.large ? { source: media.media_details.sizes.large.source_url } : undefined,
      full: media.media_details.sizes.full ? { source: media.media_details.sizes.full.source_url } : undefined,
    };
  }
}