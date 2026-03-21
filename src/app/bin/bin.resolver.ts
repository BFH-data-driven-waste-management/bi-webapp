import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { BinDTO } from './bin.model';
import { BinService } from './bin.service';

export const binResolver: ResolveFn<BinDTO> = (route) => {
  const binService = inject(BinService);

  const coordX = Number(route.paramMap.get('coordX'));
  const coordY = Number(route.paramMap.get('coordY'));

  return binService.getBinByCoords(coordX, coordY);
};

export const binsResolver: ResolveFn<BinDTO[]> = () => {
  const binService = inject(BinService);
  return binService.getBins();
};
