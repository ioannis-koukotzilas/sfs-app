import { Component, OnInit, Type } from '@angular/core';
import { PageDefaultComponent } from '../page-default/page-default.component';
import { PageInfoComponent } from '../page-info/page-info.component';
import { PageContactComponent } from '../page-contact/page-contact.component';
import { ActivatedRoute } from '@angular/router';
import { PageHomeComponent } from '../page-home/page-home.component';
import { PageAboutComponent } from '../page-about/page-about.component';

@Component({
  selector: 'app-page-wrapper',
  templateUrl: './page-wrapper.component.html',
  styleUrl: './page-wrapper.component.css',
})
export class PageWrapperComponent implements OnInit {
  currentComponent!: Type<any>;

  private mappings: { [key: string]: Type<any> } = {
    default: PageDefaultComponent,
    '/': PageHomeComponent,
    info: PageInfoComponent,
    about: PageAboutComponent,
    contact: PageContactComponent,
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      this.currentComponent = slug && this.mappings[slug] ? this.mappings[slug] : this.mappings['default'];
    });
  }
}
