import { TourVisitVM } from './tour.model';
import { FillLevel, VisitAction } from '../shared/models/common.model';

/**
 * This file capsules presentation-related constants: pragmatic enum translations (for now) and tag styles (severities).
 */

export const BIN_VISIT_FILL_LEVEL_ORDER: readonly FillLevel[] = [
  FillLevel.OVERFULL,
  FillLevel.FULL,
  FillLevel.HALF_FULL,
  FillLevel.EMPTY_OR_ALMOST_EMPTY,
];

export const BIN_VISIT_FILL_LEVEL_LABELS: Record<FillLevel, string> = {
  OVERFULL: 'Übervoll',
  FULL: 'Voll',
  HALF_FULL: 'Halbvoll',
  EMPTY_OR_ALMOST_EMPTY: 'Leer oder fast leer',
};

export const BIN_VISIT_FILL_LEVEL_TAG_CLASSES: Record<FillLevel, string> = {
  OVERFULL: 'bg-gray-700 text-white',
  FULL: 'bg-red-500 text-white',
  HALF_FULL: 'bg-red-200 text-gray-900',
  EMPTY_OR_ALMOST_EMPTY: 'bg-gray-200 text-gray-700',
};

export const BIN_VISIT_ACTION_LABELS: Record<VisitAction, string> = {
  EMPTIED: 'Geleert',
  NOT_EMPTIED: 'Nicht geleert',
};

export const BIN_VISIT_ACTION_TAG_SEVERITIES: Record<VisitAction, TourVisitVM['visitActionSeverity']> = {
  EMPTIED: 'success',
  NOT_EMPTIED: 'contrast',
};

export const BIN_TYPE_TAG_SEVERITY = 'secondary';
