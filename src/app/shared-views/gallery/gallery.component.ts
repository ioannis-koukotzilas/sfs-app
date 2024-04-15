import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Media } from '../../models/entities/media';
import { Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper } from 'swiper';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent {
  @Input() galleryMedia?: Media[];

  @ViewChild('swiper') swiperEl!: ElementRef;

  swiper!: Swiper;

  index = 0;

  visible = false;

  constructor(private cd: ChangeDetectorRef) {}

  openModal(index: number): void {
    this.visible = true;
    this.cd.detectChanges();
    this.initSwiper(index);
    document.body.classList.add('gallery-modal-active');
    document.addEventListener('keydown', this.onKeyEscape);
  }

  closeModal(): void {
    this.swiper.destroy(true, true);
    document.body.classList.remove('gallery-modal-active');
    document.removeEventListener('keydown', this.onKeyEscape);
    this.visible = false;
  }

  private initSwiper(index: number): void {
    this.swiper = new Swiper(this.swiperEl.nativeElement, {
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
      this.closeModal();
    }
  };
}
