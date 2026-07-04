import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Event } from '../../../model/entity.definition';
import { DatePipe } from '@angular/common';
import { GraphQLHelper } from '../../../services/graphql-helper';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Loader } from '../../loader/loader';
import { MetaHelper } from '../../../services/metadata-helper';
import { TitleHelper } from '../../../services/title-helper';

@Component({
  selector: 'app-event-list',
  imports: [DatePipe, RouterLink, Loader],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
  loading = false;
  events: Event[] = [];

  private cd = inject(ChangeDetectorRef);
  private graphQLHelper = inject(GraphQLHelper);
  private metaHelper = inject(MetaHelper);
  private destroyRef = inject(DestroyRef);
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
      .queryEvents()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Event[]) => {
          this.setEvents(data);
          this.titleHelper.setTitle('Εκδηλώσεις');
          this.setSEOMetadata(this.events);
          this.setLoading(false);
        },
        error: (error) => {
          console.error(error);
          this.setLoading(false);
        },
      });
  }

  private setEvents(data: Event[]): void {
    this.events = [...data].sort((a, b) => {
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    });
  }

  private setSEOMetadata(data: Event[]): void {
    const metadata = this.metaHelper.getSEOMetadata(
      'Εκδηλώσεις',
      'Ενημέρωση για τις εκδηλώσεις της Επιτροπής Αγώνα Μεγ. Παναγίας ενάντια σε κάθε νέα μεταλλευτική και μεταλλουργική δραστηριότητα στη Β. Χαλκιδική.',
      'events',
      data[0]?.featuredImage?.sourceUrl,
    );

    this.metaHelper.setSEOMetadata(metadata);
  }
}
