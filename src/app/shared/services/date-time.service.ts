import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

type ChDateFormat = 'full' | 'time' | 'date';

@Injectable({
  providedIn: 'root',
})
export class DateTimeService {
  private static readonly LOCALE = 'de-CH';
  private static readonly TIMEZONE = 'Europe/Zurich';
  private static readonly FORMATS: Record<ChDateFormat, string> = {
    full: 'EEE, dd.MM.y, HH:mm',
    time: 'HH:mm',
    date: 'dd.MM.y',
  };

  format(value: string | number | Date | null | undefined, format: ChDateFormat = 'full'): string {
    if (value == null || value === '') {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return formatDate(
      date,
      DateTimeService.FORMATS[format],
      DateTimeService.LOCALE,
      DateTimeService.TIMEZONE,
    );
  }

  formatDateKey(dateKey: number): string {
    const value = String(dateKey);
    if (value.length !== 8) {
      return value;
    }
    const year = dateKey.toString().slice(0, 4);
    const month = dateKey.toString().slice(4, 6);
    const day = dateKey.toString().slice(6, 8);
    return `${day}.${month}.${year}`;
  }
}
