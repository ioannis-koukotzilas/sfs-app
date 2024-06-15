import { Component } from '@angular/core';
import { PageDefault } from '../../../models/entities/pageDefault';
import { ActivatedRoute } from '@angular/router';
import { WpService } from '../../../services/wp.service';
import { Title } from '@angular/platform-browser';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FormControl, FormGroup } from '@angular/forms';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-page-contact',
  templateUrl: './page-contact.component.html',
  styleUrl: './page-contact.component.css',
})
export class PageContactComponent {
  private _subscriptions: Subscription = new Subscription();
  private _appTitle = environment.appTitle;

  page!: PageDefault;

  constructor(private _route: ActivatedRoute, private _wpService: WpService, private _loadingService: LoadingService, private _titleService: Title) {}

  ngOnInit(): void {
    this.getPage();
  }

  ngOnDestroy(): void {}

  private checkRouteParams(): Observable<PageDefault | null> {
    return this._route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        return slug ? this._wpService.getPageDefault(slug) : of(null);
      })
    );
  }

  private getPage(): void {
    const routeParamsSubscription = this.checkRouteParams().subscribe({
      next: (data) => {
        if (data) {
          this.initPageData(data);
          this.initTitle();
          this.initReactiveModel();
          this._loadingService.set(false);
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this._loadingService.set(false);
      },
    });

    this._subscriptions.add(routeParamsSubscription);
  }

  private initPageData(data: any): void {
    this.page = new PageDefault();
    this.page.title = data.title.rendered;
    this.page.content = data.content.rendered;
  }

  private initTitle(): void {
    if (this.page.title) {
      this._titleService.setTitle(this.page.title + ' - ' + this._appTitle);
    } else {
      this._titleService.setTitle(this._appTitle);
    }
  }

  form!: FormGroup;

  initReactiveModel() {
    this.form = new FormGroup({
      email: new FormControl(''),
      name: new FormControl(''),
    });
  }

  entryMapping: { [key: string]: string } = {
    email: '497070429',
    name: '1539895170',
  };

  submitForm() {
    const baseActionUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSewatZjn_NmvnIU-140jw7ZIv0H5QK7zIZz13DLLhVWJbcWmA/formResponse';

    const queryParams = Object.keys(this.form.value)
      .map((key) => `entry.${this.entryMapping[key]}=${encodeURIComponent(this.form.value[key])}`)
      .join('&');

    const fullUrl = `${baseActionUrl}?submit=Submit&usp=pp_url&${queryParams}`;
    // window.open(fullUrl, '_blank');
  }
}
