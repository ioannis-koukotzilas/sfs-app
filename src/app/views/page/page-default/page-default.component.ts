import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { Title } from '@angular/platform-browser';
import { of, switchMap } from 'rxjs';
import { PageDefault } from '../../../models/entities/pageDefault';

@Component({
  selector: 'app-page-default',
  templateUrl: './page-default.component.html',
  styleUrl: './page-default.component.css',
})
export class PageDefaultComponent implements OnInit, OnDestroy {
  page!: PageDefault;

  constructor(
    private _route: ActivatedRoute,
    private _wpService: WpService,
    private _titleService: Title
  ) {}

  ngOnInit(): void {
    this.getPage();
  }

  ngOnDestroy(): void {}

  private getPage(): void {
    this._route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug');
          return slug ? this._wpService.getPageDefault(slug) : of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.initPageData(data);
            this._titleService.setTitle(`${data.title} - KOCMOC`);
          }
        },
        error: (error) => {
          console.error('Main observable error:', error);
        },
      });
  }

  private initPageData(data: any): void {
    this.page = new PageDefault();
    this.page.title = data.title.rendered;
    this.page.content = data.content.rendered;
  }
}
