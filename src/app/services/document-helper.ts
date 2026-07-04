import { DOCUMENT, inject, Service } from '@angular/core';

@Service()
export class DocumentHelper {
  private document = inject(DOCUMENT);
  private currentClasses = new Set<string>();

  set(classNames: string | string[]): void {
    this.clear();
    this.add(classNames);
  }

  add(classNames: string | string[]): void {
    const classes = this.normalize(classNames);

    this.document.body.classList.add(...classes);

    classes.forEach((className) => {
      this.currentClasses.add(className);
    });
  }

  remove(classNames: string | string[]): void {
    const classes = this.normalize(classNames);

    this.document.body.classList.remove(...classes);

    classes.forEach((className) => {
      this.currentClasses.delete(className);
    });
  }

  clear(): void {
    if (!this.currentClasses.size) {
      return;
    }

    this.document.body.classList.remove(...this.currentClasses);
    this.currentClasses.clear();
  }

  private normalize(classNames: string | string[]): string[] {
    return Array.isArray(classNames) ? classNames : [classNames];
  }
}
