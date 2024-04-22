import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTime',
})
export class DateTimePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    const date = new Date(value);
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    const dateFormatter = new Intl.DateTimeFormat('el-GR', dateOptions);
    const timeFormatter = new Intl.DateTimeFormat('el-GR', timeOptions);

    const formattedDate = dateFormatter.format(date);
    const formattedTime = timeFormatter.format(date);

    return `${formattedDate}, ${formattedTime}`;
  }
}
