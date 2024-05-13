import { Component, Input } from '@angular/core';
import { Media } from '../../models/entities/media';

@Component({
  selector: 'app-article-featured-media',
  templateUrl: './article-featured-media.component.html',
  styleUrl: './article-featured-media.component.css'
})
export class ArticleFeaturedMediaComponent {
  @Input() media?: Media;
  @Input() showCaption = false;
}