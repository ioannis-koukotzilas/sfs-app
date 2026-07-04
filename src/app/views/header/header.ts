import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @ViewChild('menuContainer') menuContainer?: ElementRef<HTMLElement>;
  
  menuVisible = false;

  private cd = inject(ChangeDetectorRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.menuVisible) {
      return;
    }

    const target = event.target as Node;
    const clickedInsideMenu = this.menuContainer?.nativeElement.contains(target);

    if (!clickedInsideMenu) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
    this.cd.markForCheck();
  }

  closeMenu(): void {
    this.menuVisible = false;
    this.cd.markForCheck();
  }
}
