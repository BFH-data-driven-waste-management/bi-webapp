import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { BinService } from '../bin/bin.service';
import { BinDTO } from '../bin/bin.dto';

export const binResolver: ResolveFn<BinDTO> = (route) => {
  const binService = inject(BinService);

  const coordX = Number(route.paramMap.get('coordX'));
  const coordY = Number(route.paramMap.get('coordY'));

  return binService.getBinByCoords(coordX, coordY);
};
