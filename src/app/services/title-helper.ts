import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Title } from '@angular/platform-browser';

@Service()
export class TitleHelper {
  private appTitle = environment.appTitle;

  private title = inject(Title);

  setTitle(title?: string): void {
    title ? this.title.setTitle(title + ' | ' + this.appTitle) : this.title.setTitle(this.appTitle);
  }
}
