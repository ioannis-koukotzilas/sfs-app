import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageDefaultComponent } from './views/page/page-default/page-default.component';
import { EditionDetailComponent } from './views/edition/edition-detail/edition-detail.component';
import { EditionListComponent } from './views/edition/edition-list/edition-list.component';
import { NewsDetailComponent } from './views/news/news-detail/news-detail.component';
import { EventDetailComponent } from './views/event/event-detail/event-detail.component';
import { EventListComponent } from './views/event/event-list/event-list.component';
import { NewsListComponent } from './views/news/news-list/news-list.component';

const routes: Routes = [
  { path: 'page/:slug', component: PageDefaultComponent },
  { path: 'editions', component: EditionListComponent },
  { path: 'edition/:slug', component: EditionDetailComponent },
  { path: 'news', component: NewsListComponent },
  { path: 'news/:slug', component: NewsDetailComponent },
  { path: 'events', component: EventListComponent },
  { path: 'event/:slug', component: EventDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
