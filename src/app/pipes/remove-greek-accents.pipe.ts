import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeGreekAccents',
})
export class RemoveGreekAccentsPipe implements PipeTransform {
  private readonly greekAccentsMap: { [key: string]: string } = {
    Ά: 'Α',
    Έ: 'Ε',
    Ή: 'Η',
    Ί: 'Ι',
    Ό: 'Ο',
    Ύ: 'Υ',
    Ώ: 'Ω',
    ά: 'α',
    έ: 'ε',
    ή: 'η',
    ί: 'ι',
    ό: 'ο',
    ύ: 'υ',
    ώ: 'ω',
  };

  transform(value: string): string {
    if (!value) return value;
    return value
      .split('')
      .map((char) => this.greekAccentsMap[char] || char)
      .join('');
  }
}
