import { HonorId, Suit, TileNumber } from '@core';
import { HonorMeta } from './tile-presentation.types';

/**
 * Presentation data for rendering Mahjong tiles — glyphs, CSS ink classes,
 * and pip layouts. Lives in `shared` next to `MahjongTileComponent` because
 * it describes how a tile *looks*, not what a tile *is* (see core/models).
 */

/** Chinese numerals for the character (萬) suit. */
export const NUM_CN: Record<TileNumber, string> = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '七',
  8: '八',
  9: '九',
};

/**
 * Pip layout per number on a 3×3 tile face (true = pip, false = empty).
 * Used by the dots and bamboo suits.
 */
export const PIP: Record<TileNumber, readonly boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [false, true, false, false, false, false, false, true, false],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
  7: [true, false, true, true, true, true, true, false, true],
  8: [true, true, true, true, false, true, true, true, true],
  9: [true, true, true, true, true, true, true, true, true],
};

/** Static presentation metadata for each honor tile. */
export const HONOR_META: Record<HonorId, HonorMeta> = {
  red: { glyph: '中', name: 'Red Dragon', ink: 'g-red', type: 'dragon' },
  green: { glyph: '發', name: 'Green Dragon', ink: 'g-green', type: 'dragon' },
  white: { glyph: '白', name: 'White Dragon', ink: 'g-blue', type: 'dragon' },
  E: { glyph: '東', name: 'East Wind', ink: 'g-ink', type: 'wind', letter: 'E' },
  S: { glyph: '南', name: 'South Wind', ink: 'g-ink', type: 'wind', letter: 'S' },
  W: { glyph: '西', name: 'West Wind', ink: 'g-ink', type: 'wind', letter: 'W' },
  N: { glyph: '北', name: 'North Wind', ink: 'g-ink', type: 'wind', letter: 'N' },
};

const SUIT_LABEL: Record<Suit, string> = {
  dots: 'Dots',
  bamboo: 'Bamboo',
  chars: 'Characters',
};

/** Human-readable suit label (for aria-labels). */
export function suitLabel(suit: Suit): string {
  return SUIT_LABEL[suit];
}
