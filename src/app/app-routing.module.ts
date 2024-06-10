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
import { pageHomeResolver } from './views/page/page-home/page-home.resolver';
import { newsListResolver } from './views/news/news-list/news-list.resolver';
import { newsDetailResolver } from './views/news/news-detail/news-detail.resolver';
import { eventListResolver } from './views/event/event-list/event-list.resolver';
import { editionListResolver } from './views/edition/edition-list/edition-list.resolver';
import { eventDetailResolver } from './views/event/event-detail/event-detail.resolver';
import { editionDetailResolver } from './views/edition/edition-detail/edition-detail.resolver';
import { PageAboutComponent } from './views/page/page-about/page-about.component';
import { pageAboutResolver } from './views/page/page-about/page-about.resolver';
import { pageDefaultResolver } from './views/page/page-default/page-default.resolver';

const routes: Routes = [
  { path: '', component: PageHomeComponent, resolve: { page: pageHomeResolver } },
  { path: 'about', component: PageAboutComponent, resolve: { page: pageAboutResolver } },

  { path: 'editions', redirectTo: 'editions/page/1', pathMatch: 'full' },
  { path: 'editions/page/:page', component: EditionListComponent, resolve: { data: editionListResolver } },
  { path: 'edition/:slug', component: EditionDetailComponent, resolve: { data: editionDetailResolver } },

  { path: 'news', redirectTo: 'news/page/1', pathMatch: 'full' },
  { path: 'news/page/:page', component: NewsListComponent, resolve: { data: newsListResolver } },
  { path: 'news/:slug', component: NewsDetailComponent, resolve: { data: newsDetailResolver } },

  { path: 'events', redirectTo: 'events/page/1', pathMatch: 'full' },
  { path: 'events/page/:page', component: EventListComponent, resolve: { data: eventListResolver } },
  { path: 'event/:slug', component: EventDetailComponent, resolve: { data: eventDetailResolver } },

  { path: 'news/category/:slug', redirectTo: 'news/category/:slug/page/1', pathMatch: 'full' },
  { path: 'news/category/:slug/page/:page', component: NewsCategoryDetailComponent },

  { path: ':slug', component: PageWrapperComponent, resolve: { page: pageDefaultResolver } }, // Most generic route goes last
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
