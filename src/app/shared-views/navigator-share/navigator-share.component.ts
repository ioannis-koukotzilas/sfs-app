import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-navigator-share',
  templateUrl: './navigator-share.component.html',
  styleUrl: './navigator-share.component.css',
})
export class NavigatorShareComponent {
  @Input() shareData?: ShareData;

  canShare = false;
  copiedToClipboard = false;

  navigatorShare(): void {
    if (navigator.canShare && navigator.canShare(this.shareData)) {
      this.canShare = true;
      navigator
        .share(this.shareData)
        .then(() => console.log('Share was successful.'))
        .catch((error) => console.error('Sharing failed', error));
    } else {
      console.warn('Your browser does not support sharing this data.');
      this.canShare = false;
    }
  }

  copyToClipboard(): void {
    if (!this.shareData?.url) return;

    navigator.clipboard
      .writeText(this.shareData.url)
      .then(() => {
        this.copiedToClipboard = true;
        setTimeout(() => (this.copiedToClipboard = false), 3000);
      })
      .catch((err) => {
        console.warn('Failed to copy:', err);
      });
  }
}