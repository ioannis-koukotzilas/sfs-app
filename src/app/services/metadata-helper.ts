import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Meta } from '@angular/platform-browser';
import { SEOMetadata } from '../model/entity.definition';

@Service()
export class MetaHelper {
  private appTitle = environment.appTitle;

  private meta = inject(Meta);

  getSEOMetadata(title?: string, content?: string, slug?: string, imageUrl?: string): SEOMetadata {
    return {
      title: title ?? '',
      description: content ? this.formatDescription(content) : '',
      url: slug ? environment.siteUrl + slug : '',
      imageUrl: imageUrl ?? '',
    };
  }

  setSEOMetadata(metadata: SEOMetadata): void {
    this.updateBaseTitle(metadata.title);
    this.updateBaseDescription(metadata.description);
    this.updateUrl(metadata.url);
    this.updateTitle(metadata.title);
    this.updateDescription(metadata.description);
    this.updateImage(metadata.imageUrl);
  }

  updateBaseTitle(title: string) {
    this.meta.updateTag({ name: 'title', content: title + ' | ' + this.appTitle });
  }

  updateBaseDescription(description: string) {
    this.meta.updateTag({ name: 'description', content: description });
  }

  updateUrl(url: string) {
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'twitter:url', content: url });
  }

  updateTitle(title: string) {
    this.meta.updateTag({ property: 'og:title', content: title + ' | ' + this.appTitle });
    this.meta.updateTag({ property: 'twitter:title', content: title + ' | ' + this.appTitle });
  }

  updateDescription(description: string) {
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({
      property: 'twitter:description',
      content: description,
    });
  }

  updateImage(imageUrl: string) {
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'twitter:image', content: imageUrl });
  }

  removeAll() {
    const names = ['title', 'description'];

    const properties = [
      'og:url',
      'twitter:url',
      'og:title',
      'twitter:title',
      'og:description',
      'twitter:description',
      'og:image',
      'twitter:image',
    ];

    names.forEach((name) => {
      this.meta.removeTag(`name='${name}'`);
    });

    properties.forEach((property) => {
      this.meta.removeTag(`property='${property}'`);
    });
  }

  formatDescription(html: string): string {
    const string = html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Collapse multiple white spaces into one
      .trim();

    if (string.length > 500) {
      return string.slice(0, 500) + ' [...]';
    } else {
      return string;
    }
  }
}
