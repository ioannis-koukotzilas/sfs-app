import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { PageDefaultComponent } from './views/page/page-default/page-default.component';
import { PageHomeComponent } from './views/page/page-home/page-home.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { EditionDetailComponent } from './views/edition/edition-detail/edition-detail.component';
import { NewsDetailComponent } from './views/news/news-detail/news-detail.component';
import { EditionListComponent } from './views/edition/edition-list/edition-list.component';
import { NewsListComponent } from './views/news/news-list/news-list.component';
import { EventListComponent } from './views/event/event-list/event-list.component';
import { EventDetailComponent } from './views/event/event-detail/event-detail.component';
import { HttpErrorInterceptor } from './interceptor/http-error.interceptor';
import { LoadingProgressComponent } from './core/loading-progress/loading-progress.component';
import { HttpLoadingInterceptor } from './interceptor/http-loading.interceptor';
import { GalleryComponent } from './shared-views/gallery/gallery.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    PageDefaultComponent,
    PageHomeComponent,
    EditionListComponent,
    EditionDetailComponent,
    NewsListComponent,
    NewsDetailComponent,
    EventListComponent,
    EventDetailComponent,
    LoadingProgressComponent,
    GalleryComponent
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpLoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
