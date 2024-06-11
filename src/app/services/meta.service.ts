import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class MetaService {
  constructor(private _meta: Meta) {}

  updateBaseTitle(title: string) {
    this._meta.updateTag({ name: 'title', content: title });
  }

  updateBaseDescription(description: string) {
    this._meta.updateTag({ name: 'description', content: description });
  }

  updateUrl(url: string) {
    this._meta.updateTag({ property: 'og:url', content: url });
    this._meta.updateTag({ property: 'twitter:url', content: url });
  }

  updateTitle(title: string) {
    this._meta.updateTag({ property: 'og:title', content: title });
    this._meta.updateTag({ property: 'twitter:title', content: title });
  }

  updateDescription(description: string) {
    this._meta.updateTag({ property: 'og:description', content: description });
    this._meta.updateTag({
      property: 'twitter:description',
      content: description,
    });
  }

  updateImage(imageUrl: string) {
    this._meta.updateTag({ property: 'og:image', content: imageUrl });
    this._meta.updateTag({ property: 'twitter:image', content: imageUrl });
  }

  removeAll() {
    const names = ['title', 'description'];

    const properties = ['og:url', 'twitter:url', 'og:title', 'twitter:title', 'og:description', 'twitter:description', 'og:image', 'twitter:image'];

    names.forEach((name) => {
      this._meta.removeTag(`name='${name}'`);
    });

    properties.forEach((property) => {
      this._meta.removeTag(`property='${property}'`);
    });
  }

  formatDescription(html: string): string {
    return (
      html
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Remove double white spaces
        .trim()
        .slice(0, 500) + ' [...]'
    );
  }
}
