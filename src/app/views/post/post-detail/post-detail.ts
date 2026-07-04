import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Post } from '../../../model/entity.definition';
import { GraphQLHelper } from '../../../services/graphql-helper';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { Loader } from '../../loader/loader';
import { DatePipe } from '@angular/common';
import { MetaHelper } from '../../../services/metadata-helper';
import { TitleHelper } from '../../../services/title-helper';

@Component({
  selector: 'app-post-detail',
  imports: [Loader, DatePipe],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail implements OnInit {
  post: Post | null = null;
  loading = false;

  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private graphQLHelper = inject(GraphQLHelper);
  private metaHelper = inject(MetaHelper);
  private route = inject(ActivatedRoute);
  private titleHelper = inject(TitleHelper);

  ngOnInit(): void {
    this.checkRouteParams();
  }

  private setLoading(isLoading: boolean) {
    this.loading = isLoading;
    this.cd.markForCheck();
  }

  private checkRouteParams(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = String(params['slug']);
      this.fetchData(slug);
    });
  }

  private fetchData(slug: string): void {
    this.setLoading(true);
    this.graphQLHelper
      .queryPost(slug)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Post | null) => {
          this.post = data;
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

  private setSEOMetadata(data: Post | null): void {
    const metadata = this.metaHelper.getSEOMetadata(
      data?.title,
      data?.content,
      data?.slug,
      data?.featuredImage?.sourceUrl,
    );

    this.metaHelper.setSEOMetadata(metadata);
  }
}
