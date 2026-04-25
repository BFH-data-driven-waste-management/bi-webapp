import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-details-page-header',
  imports: [Skeleton],
  templateUrl: './details-page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsPageHeader {
  readonly title = input.required<string>();
  readonly loading = input(false);
}
