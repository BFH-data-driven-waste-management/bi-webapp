import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chDateTime',
  standalone: true,
})
export class ChDateTimePipe implements PipeTransform {
  private readonly formatter = new Intl.DateTimeFormat('de-CH', {
      timeZone: 'Europe/Zurich',
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
  });

  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return this.formatter.format(date);
  }
}
