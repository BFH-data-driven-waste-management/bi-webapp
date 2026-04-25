import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-details-page-header',
  templateUrl: './details-page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsPageHeader {
  readonly title = input.required<string>();
}
