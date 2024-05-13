import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Media } from '../../models/entities/media';
import { Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper } from 'swiper';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements AfterViewInit {
  @Input() galleryMedia?: Media[];

  @ViewChild('gallerySwiper') gallerySwiperEl!: ElementRef;
  @ViewChild('galleryModalSwiper') galleryModalSwiperEl!: ElementRef;

  gallerySwiper!: Swiper;
  galleryModalSwiper!: Swiper;

  index = 0;

  galleryModalVisible = false;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.initGallerySwiper();
  }

  private initGallerySwiper(): void {
    this.gallerySwiper = new Swiper(this.gallerySwiperEl.nativeElement, {
      modules: [Navigation, Keyboard],
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      slidesPerView: 1,
      spaceBetween: 20,
      breakpoints: {
        480: {
          slidesPerView: 2,
        },
        720: {
          slidesPerView: 3,
        },
      },
    });
  }

  openGalleryModal(index: number): void {
    this.galleryModalVisible = true;
    this.cd.detectChanges();
    this.initGalleryModalSwiper(index);
    document.body.classList.add('gallery-modal-active');
    document.addEventListener('keydown', this.onKeyEscape);
  }

  closeGalleryModal(): void {
    this.galleryModalSwiper.destroy(true, true);
    document.body.classList.remove('gallery-modal-active');
    document.removeEventListener('keydown', this.onKeyEscape);
    this.galleryModalVisible = false;
  }

  private initGalleryModalSwiper(index: number): void {
    this.galleryModalSwiper = new Swiper(this.galleryModalSwiperEl.nativeElement, {
      modules: [Navigation, Pagination, Keyboard],
      initialSlide: index,
      pagination: {
        el: '.swiper-pagination',
        type: 'custom',
        renderCustom: function (swiper, current, total) {
          return current + '/' + total;
        },
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      spaceBetween: 20,
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
    });
  }

  private onKeyEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.closeGalleryModal();
    }
  };
}
