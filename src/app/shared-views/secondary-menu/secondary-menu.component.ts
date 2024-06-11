import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-secondary-menu',
  templateUrl: './secondary-menu.component.html',
  styleUrl: './secondary-menu.component.css',
})
export class SecondaryMenuComponent {
  @Input() navigateAfterCloseSidebar?: (route: string[]) => void;
  @Input() parent?: string;

  constructor(private _router: Router) {}

  navigate(route: string[]) {
    if (this.navigateAfterCloseSidebar) {
      this.navigateAfterCloseSidebar(route);
    } else {
      this._router.navigate(route);
    }
  }
}
