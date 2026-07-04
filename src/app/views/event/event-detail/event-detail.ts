import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { GraphQLHelper } from '../../../services/graphql-helper';
import { take } from 'rxjs';
import { Event } from '../../../model/entity.definition';
import { Loader } from '../../loader/loader';
import { DatePipe } from '@angular/common';
import { MetaHelper } from '../../../services/metadata-helper';
import { TitleHelper } from '../../../services/title-helper';

@Component({
  selector: 'app-event-detail',
  imports: [Loader, DatePipe],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail implements OnInit {
  event: Event | null = null;
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
      .queryEvent(slug)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Event | null) => {
          this.event = data;
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

  private setSEOMetadata(data: Event | null): void {
    const metadata = this.metaHelper.getSEOMetadata(
      data?.title,
      data?.content,
      data?.slug,
      data?.featuredImage?.sourceUrl,
    );

    this.metaHelper.setSEOMetadata(metadata);
  }
}
