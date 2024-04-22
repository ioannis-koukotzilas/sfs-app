import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isoDate',
})
export class IsoDatePipe implements PipeTransform {
  transform(value: any): any {
    if (!value) return value;

    const date = new Date(value);
    return date.toISOString().split('T')[0];
  }
}
