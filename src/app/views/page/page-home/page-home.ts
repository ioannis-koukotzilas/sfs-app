import { ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { GraphQLHelper } from '../../../services/graphql-helper';
import { take } from 'rxjs';
import { Image, Page } from '../../../model/entity.definition';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentHelper } from '../../../services/document-helper';
import { Loader } from '../../loader/loader';
import { MetaHelper } from '../../../services/metadata-helper';
import { TitleHelper } from '../../../services/title-helper';

@Component({
  selector: 'app-page-home',
  imports: [Loader],
  templateUrl: './page-home.html',
  styleUrl: './page-home.css',
})
export class PageHome implements OnInit, OnDestroy {
  page: Page | null = null;
  coverImage: Image | null = null;
  loading = false;

  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private documentHelper = inject(DocumentHelper);
  private graphQLHelper = inject(GraphQLHelper);
  private metaHelper = inject(MetaHelper);
  private titleHelper = inject(TitleHelper);

  constructor() {
    this.documentHelper.set(['dark', 'home']);
  }

  ngOnInit(): void {
    this.fetchData('home');
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
          this.titleHelper.setTitle('SCOMP.CC');
          this.coverImage = this.getRandomImage(data?.gallery);
          this.setSEOMetadata(data);
          this.setLoading(false);
        },
        error: (error) => {
          console.error(error);
          this.setLoading(false);
        },
      });
  }

  private getRandomImage(gallery?: Image[]): Image | null {
    if (!gallery || gallery.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * gallery.length);
    return gallery[index];
  }

  private setSEOMetadata(data: Page | null): void {
    const metadata = this.metaHelper.getSEOMetadata(
      'SCOMP.CC',
      data?.content,
      data?.slug,
      data?.featuredImage?.sourceUrl,
    );

    this.metaHelper.setSEOMetadata(metadata);
  }
}
