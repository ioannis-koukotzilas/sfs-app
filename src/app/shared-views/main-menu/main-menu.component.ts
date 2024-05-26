import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.css',
})
export class MainMenuComponent {
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
