import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  constructor() {}

  // public mapMediaSize(media: any): any {
  //   return {
  //     thumbnail: media.media_details.sizes.thumbnail ? { source: media.media_details.sizes.thumbnail.source_url } : undefined,
  //     medium: media.media_details.sizes.medium ? { source: media.media_details.sizes.medium.source_url } : undefined,
  //     mediumLarge: media.media_details.sizes.medium_large ? { source: media.media_details.sizes.medium_large.source_url } : undefined,
  //     large: media.media_details.sizes.large ? { source: media.media_details.sizes.large.source_url } : undefined,
  //     full: media.media_details.sizes.full ? { source: media.media_details.sizes.full.source_url } : undefined,
  //   };
  // }

  public mapMediaSize(media: any): any {
    const sizes = media.media_details.sizes;

    // Initialize with the smallest available size, then fallback to larger sizes
    const thumbnail = sizes.thumbnail ? { source: sizes.thumbnail.source_url } : undefined;
    const medium = sizes.medium ? { source: sizes.medium.source_url } : thumbnail;
    const mediumLarge = sizes.medium_large ? { source: sizes.medium_large.source_url } : medium;
    const large = sizes.large ? { source: sizes.large.source_url } : mediumLarge;
    const full = sizes.full ? { source: sizes.full.source_url } : large;

    return {
      thumbnail,
      medium,
      mediumLarge,
      large,
      full
    };
  }
}