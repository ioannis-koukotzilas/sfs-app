import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Post } from '../../../model/entity.definition';
import { RouterLink } from '@angular/router';
import { Loader } from '../../loader/loader';
import { GraphQLHelper } from '../../../services/graphql-helper';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { MetaHelper } from '../../../services/metadata-helper';
import { TitleHelper } from '../../../services/title-helper';

@Component({
  selector: 'app-post-list',
  imports: [DatePipe, RouterLink, Loader],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit {
  loading = false;
  posts: Post[] = [];

  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private graphQLHelper = inject(GraphQLHelper);
  private metaHelper = inject(MetaHelper);
  private titleHelper = inject(TitleHelper);

  ngOnInit(): void {
    this.fetchData();
  }

  private setLoading(isLoading: boolean) {
    this.loading = isLoading;
    this.cd.markForCheck();
  }

  private fetchData() {
    this.setLoading(true);
    this.graphQLHelper
      .queryPosts()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Post[]) => {
          this.setPosts(data);
          this.titleHelper.setTitle('Κείμενα');
          this.setSEOMetadata(data);
          this.setLoading(false);
        },
        error: (error) => {
          console.error(error);
          this.setLoading(false);
        },
      });
  }

  private setPosts(data: Post[]): void {
    this.posts = [...data].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  private setSEOMetadata(data: Post[]): void {
    const metadata = this.metaHelper.getSEOMetadata(
      'Κείμενα',
      'Κείμενα, συνεντεύξεις, δράσεις και αναλύσεις της Επιτροπής Αγώνα Μεγ. Παναγίας ενάντια σε κάθε νέα μεταλλευτική και μεταλλουργική δραστηριότητα στη Β. Χαλκιδική.',
      'posts',
      data[0]?.featuredImage?.sourceUrl,
    );

    this.metaHelper.setSEOMetadata(metadata);
  }
}
