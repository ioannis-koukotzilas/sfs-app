import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date',
})
export class DatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    const date = new Date(value);
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const dateFormatter = new Intl.DateTimeFormat('el-GR', dateOptions);

    const formattedDate = dateFormatter.format(date);

    return `${formattedDate}`;
  }
}
