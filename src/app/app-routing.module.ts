import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditionDetailComponent } from './views/edition/edition-detail/edition-detail.component';
import { EditionListComponent } from './views/edition/edition-list/edition-list.component';
import { NewsDetailComponent } from './views/news/news-detail/news-detail.component';
import { EventDetailComponent } from './views/event/event-detail/event-detail.component';
import { EventListComponent } from './views/event/event-list/event-list.component';
import { NewsListComponent } from './views/news/news-list/news-list.component';
import { PageWrapperComponent } from './views/page/page-wrapper/page-wrapper.component';
import { NewsCategoryDetailComponent } from './views/category/news-category-detail/news-category-detail.component';
import { PageHomeComponent } from './views/page/page-home/page-home.component';

const routes: Routes = [
  { path: '', component: PageHomeComponent },

  { path: 'editions', redirectTo: 'editions/page/1', pathMatch: 'full' },
  { path: 'editions/page/:page', component: EditionListComponent },
  { path: 'edition/:slug', component: EditionDetailComponent },

  { path: 'news', redirectTo: 'news/page/1', pathMatch: 'full' },
  { path: 'news/page/:page', component: NewsListComponent },
  { path: 'news/:slug', component: NewsDetailComponent },

  { path: 'events', redirectTo: 'events/page/1', pathMatch: 'full' },
  { path: 'events/page/:page', component: EventListComponent },
  { path: 'event/:slug', component: EventDetailComponent },

  { path: 'news/category/:slug', redirectTo: 'news/category/:slug/page/1', pathMatch: 'full' },
  { path: 'news/category/:slug/page/:page', component: NewsCategoryDetailComponent },

  { path: ':slug', component: PageWrapperComponent }, // Most generic route goes last
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
