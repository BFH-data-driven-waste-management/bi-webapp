import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { BinService } from '../bin.service';
import { BinDTO } from '../bin.model';

export const binsResolver: ResolveFn<BinDTO[]> = () => {
  const binService = inject(BinService);
  return binService.getBins();
};
