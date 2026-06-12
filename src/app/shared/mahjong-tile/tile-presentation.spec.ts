import { HonorId, TileNumber } from '@core';
import { HONOR_META, NUM_CN, PIP, suitLabel } from './tile-presentation';

const NUMBERS: TileNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const DRAGONS: HonorId[] = ['redDragon', 'greenDragon', 'whiteDragon'];
const WINDS: HonorId[] = ['eastWind', 'southWind', 'westWind', 'northWind'];
const WIND_LETTERS: Record<HonorId, string> = {
  eastWind: 'E',
  southWind: 'S',
  westWind: 'W',
  northWind: 'N',
} as Record<HonorId, string>;

describe('tile-presentation', () => {
  describe('suitLabel', () => {
    it('returns the right label per suit', () => {
      expect(suitLabel('dots')).toBe('Dots');
      expect(suitLabel('bamboo')).toBe('Bamboo');
      expect(suitLabel('chars')).toBe('Characters');
    });
  });

  describe('PIP', () => {
    it('has a 9-cell face with exactly n filled pips for each number', () => {
      for (const n of NUMBERS) {
        const cells = PIP[n];
        expect(cells.length).toBe(9);
        expect(cells.filter(Boolean).length).toBe(n);
      }
    });
  });

  describe('NUM_CN', () => {
    it('maps every number to a Chinese numeral', () => {
      for (const n of NUMBERS) {
        expect(NUM_CN[n]).toBeTruthy();
      }
      expect(NUM_CN[5]).toBe('五');
    });
  });

  describe('HONOR_META', () => {
    it('has an entry for all seven honor ids', () => {
      expect(Object.keys(HONOR_META).sort()).toEqual([...DRAGONS, ...WINDS].sort());
    });

    it('marks the three dragons as type "dragon"', () => {
      for (const id of DRAGONS) {
        expect(HONOR_META[id].type).toBe('dragon');
        expect(HONOR_META[id].letter).toBeUndefined();
      }
    });

    it('marks the four winds as type "wind" and gives them a letter', () => {
      for (const id of WINDS) {
        expect(HONOR_META[id].type).toBe('wind');
        expect(HONOR_META[id].letter).toBe(WIND_LETTERS[id]);
      }
    });
  });
});
