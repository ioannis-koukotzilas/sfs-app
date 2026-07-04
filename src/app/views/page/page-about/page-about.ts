import { ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { Page } from '../../../model/entity.definition';
import { GraphQLHelper } from '../../../services/graphql-helper';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Loader } from '../../loader/loader';
import { MetaHelper } from '../../../services/metadata-helper';
import { TitleHelper } from '../../../services/title-helper';
import { DocumentHelper } from '../../../services/document-helper';

@Component({
  selector: 'app-page-about',
  imports: [Loader],
  templateUrl: './page-about.html',
  styleUrl: './page-about.css',
})
export class PageAbout implements OnInit, OnDestroy {
  page: Page | null = null;
  loading = false;

  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private documentHelper = inject(DocumentHelper);
  private graphQLHelper = inject(GraphQLHelper);
  private metaHelper = inject(MetaHelper);
  private titleHelper = inject(TitleHelper);

  constructor() {
    this.documentHelper.set('dark');
  }

  ngOnInit(): void {
    this.fetchData('about');
  }

  ngOnDestroy(): void {
    this.documentHelper.clear();
  }

  private setLoading(isLoading: boolean) {
    this.loading = isLoading;
    this.cd.markForCheck();
  }

  private fetchData(slug: string): void {
    this.setLoading(true);
    this.graphQLHelper
      .queryPage(slug)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Page | null) => {
          this.page = data;
          this.titleHelper.setTitle(data?.title);
          this.setSEOMetadata(data);
          this.setLoading(false);
        },
        error: (error) => {
          console.error(error);
          this.setLoading(false);
        },
      });
  }

  private setSEOMetadata(data: Page | null): void {
    const metadata = this.metaHelper.getSEOMetadata(
      data?.title,
      data?.content,
      data?.slug,
      data?.featuredImage?.sourceUrl,
    );

    this.metaHelper.setSEOMetadata(metadata);
  }
}
