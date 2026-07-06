import { Component } from '@angular/core';
import { AudioPlayer } from '../audio-player/audio-player';

@Component({
  selector: 'app-footer',
  imports: [AudioPlayer],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {}
