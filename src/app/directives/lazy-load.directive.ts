import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad], source[appLazyLoad]',
})
export class LazyLoadDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const isImg = this.el.nativeElement.tagName === 'IMG';
          const dataAttr = isImg ? 'data-src' : 'data-srcset';
          const attr = isImg ? 'src' : 'srcset';
          const value = this.el.nativeElement.getAttribute(dataAttr);
          if (value) {
            this.renderer.setAttribute(this.el.nativeElement, attr, value);
            this.renderer.addClass(this.el.nativeElement, 'loading');
            obs.unobserve(this.el.nativeElement);
          }
        }
      });
    });

    
    obs.observe(this.el.nativeElement);

  }
  }

  @HostListener('load', ['$event.target'])
  onLoad(target: EventTarget) {
    if (target && target === this.el.nativeElement) {
      this.renderer.removeClass(this.el.nativeElement, 'loading');

      setTimeout(() => {
        this.renderer.addClass(this.el.nativeElement, 'loaded');
      }, 600);
    }
  }
}
