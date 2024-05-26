import { AfterViewInit, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CoverImage } from '../../models/entities/cover';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-cover-image',
  templateUrl: './cover-image.component.html',
  styleUrl: './cover-image.component.css',
})
export class CoverImageComponent implements OnDestroy, OnChanges {
  @Input() coverImage?: CoverImage;

  constructor(@Inject(DOCUMENT) private _document: Document) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coverImage'].currentValue) {
      this.updateBodyClass();
    }
  }

  ngOnDestroy(): void {
    this.removeBodyClass();
  }

  private updateBodyClass(): void {
    if (this.coverImage && this.coverImage.media) {
      this._document.body.classList.add('cover-image');
    } else {
      this._document.body.classList.remove('cover-image');
    }
  }

  private removeBodyClass(): void {
    this._document.body.classList.remove('cover-image');
  }
}
