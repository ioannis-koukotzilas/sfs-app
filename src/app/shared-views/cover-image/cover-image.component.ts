import { Component, Input } from '@angular/core';
import { Media } from '../../models/entities/media';

@Component({
  selector: 'app-cover-image',
  templateUrl: './cover-image.component.html',
  styleUrl: './cover-image.component.css'
})
export class CoverImageComponent {
  @Input() media?: Media;
}
