import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { PageDefaultComponent } from './views/page/page-default/page-default.component';
import { PageHomeComponent } from './views/page/page-home/page-home.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { EditionDetailComponent } from './views/edition/edition-detail/edition-detail.component';
import { NewsDetailComponent } from './views/news/news-detail/news-detail.component';
import { EditionListComponent } from './views/edition/edition-list/edition-list.component';
import { NewsListComponent } from './views/news/news-list/news-list.component';
import { EventListComponent } from './views/event/event-list/event-list.component';
import { EventDetailComponent } from './views/event/event-detail/event-detail.component';
import { HttpErrorInterceptor } from './interceptor/http-error.interceptor';
import { GalleryComponent } from './shared-views/gallery/gallery.component';
import { ListPaginationComponent } from './shared-views/list-pagination/list-pagination.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ProgressBarComponent } from './shared-views/progress-bar/progress-bar.component';
import { RemoveGreekAccentsPipe } from './pipes/remove-greek-accents.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { PageInfoComponent } from './views/page/page-info/page-info.component';
import { PageContactComponent } from './views/page/page-contact/page-contact.component';
import { PageWrapperComponent } from './views/page/page-wrapper/page-wrapper.component';
import { IsoDatePipe } from './pipes/iso-date.pipe';
import { DateTimePipe } from './pipes/date-time.pipe';
import { DatePipe } from './pipes/date.pipe';
import { PageAboutComponent } from './views/page/page-about/page-about.component';
import { NavigatorShareComponent } from './shared-views/navigator-share/navigator-share.component';
import { NewsCategoryDetailComponent } from './views/category/news-category-detail/news-category-detail.component';
import { EventCategoryDetailComponent } from './views/category/event-category-detail/event-category-detail.component';
import { CoverImageComponent } from './shared-views/cover-image/cover-image.component';
import { LazyLoadDirective } from './directives/lazy-load.directive';
import { ArticleFeaturedMediaComponent } from './shared-views/article-featured-media/article-featured-media.component';
import { MainMenuComponent } from './shared-views/main-menu/main-menu.component';
import { SecondaryMenuComponent } from './shared-views/secondary-menu/secondary-menu.component';
import { LayoutModule } from '@angular/cdk/layout';

@NgModule({ declarations: [
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
        GalleryComponent,
        ListPaginationComponent,
        ProgressBarComponent,
        // Pipes
        RemoveGreekAccentsPipe,
        PageInfoComponent,
        PageContactComponent,
        PageWrapperComponent,
        IsoDatePipe,
        DateTimePipe,
        DatePipe,
        PageAboutComponent,
        NavigatorShareComponent,
        NewsCategoryDetailComponent,
        EventCategoryDetailComponent,
        CoverImageComponent,
        // directives
        LazyLoadDirective,
        ArticleFeaturedMediaComponent,
        MainMenuComponent,
        SecondaryMenuComponent
        // ang
    ],
    bootstrap: [AppComponent], imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, LayoutModule], providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpErrorInterceptor,
            multi: true,
        },
        provideAnimationsAsync(),
        provideHttpClient(withFetch())
    ] })
export class AppModule {}
