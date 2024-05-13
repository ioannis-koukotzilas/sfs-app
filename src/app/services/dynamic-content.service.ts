import { ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DynamicContentService {

  loadComponent<T>(viewContainerRef: ViewContainerRef, component: Type<T>): ComponentRef<T> {
    viewContainerRef.clear();
    return viewContainerRef.createComponent(component);  // Use the component class directly
  }

  // loadComponent(viewContainerRef: ViewContainerRef, component: Type<any>): void {
  //   viewContainerRef.clear();
  //   viewContainerRef.createComponent(component);
  // }

  clearComponent(viewContainerRef: ViewContainerRef): void {
    viewContainerRef.clear();
  }
}
