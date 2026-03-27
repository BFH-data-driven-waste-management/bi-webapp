import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChDateTimeService {
  private readonly formatterFull = new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  private readonly formatterTime = new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    hour: '2-digit',
    minute: '2-digit',
  });

  private readonly formatterDate = new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  format(
    value: string | Date | null | undefined,
    format: 'full' | 'time' | 'date' = 'full',
  ): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    switch (format) {
      case 'time':
        return this.formatterTime.format(date);
      case 'date':
        return this.formatterDate.format(date);
      case 'full':
      default:
        return this.formatterFull.format(date);
    }
  }
}
