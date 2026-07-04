import { Routes } from '@angular/router';
import { PageHome } from './views/page/page-home/page-home';
import { EventList } from './views/event/event-list/event-list';
import { EventDetail } from './views/event/event-detail/event-detail';
import { PageAbout } from './views/page/page-about/page-about';
import { PageTenDaysStruggle } from './views/page/page-ten-days-struggle/page-ten-days-struggle';
import { PostList } from './views/post/post-list/post-list';
import { PostDetail } from './views/post/post-detail/post-detail';

export const routes: Routes = [
  { path: '', component: PageHome },
  { path: 'about', component: PageAbout },
  { path: 'events', component: EventList },
  { path: 'event/:slug', component: EventDetail },
  { path: 'posts', component: PostList },
  { path: 'post/:slug', component: PostDetail },
  { path: 'ten-days-struggle', component: PageTenDaysStruggle },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
