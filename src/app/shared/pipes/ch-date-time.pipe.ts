import { inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import { ChDateTimeService } from './ch-date-time.service';

@Pipe({
  name: 'chDateTime',
  standalone: true,
})
@Injectable({
  providedIn: 'root',
})
export class ChDateTimePipe implements PipeTransform {
  private readonly chDateTimeService = inject(ChDateTimeService);

  transform(
    value: string | Date | null | undefined,
    format: 'full' | 'time' | 'date' = 'full',
  ): string {
    return this.chDateTimeService.format(value, format);
  }
}
