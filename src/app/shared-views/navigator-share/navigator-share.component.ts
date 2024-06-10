import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-navigator-share',
  templateUrl: './navigator-share.component.html',
  styleUrl: './navigator-share.component.css',
})
export class NavigatorShareComponent {
  @Input() shareData?: ShareData;

  copiedToClipboard = false;

  navigatorShare(): void {
    if (navigator.canShare && navigator.canShare(this.shareData)) {
      navigator
        .share(this.shareData)
        .then(() => console.log('Share was successful.'))
        .catch((err) => console.error('Failed to share: ', err));
    } else {
      console.warn('Browser does not support navigator.');
      this.copyToClipboard();
    }
  }

  private copyToClipboard(): void {
    if (!this.shareData?.url) return;

    navigator.clipboard
      .writeText(this.shareData.url)
      .then(() => {
        this.copiedToClipboard = true;
        setTimeout(() => (this.copiedToClipboard = false), 3000);
      })
      .catch((err) => {
        console.warn('Failed to copy: ', err);
      });
  }
}
