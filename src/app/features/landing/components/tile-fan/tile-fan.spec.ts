import { TestBed } from '@angular/core/testing';
import { Tile } from '@core';
import { TileFanComponent } from './tile-fan';

const FIVE_TILES: Tile[] = [
  { kind: 'honor', honorId: 'eastWind' },
  { kind: 'num', value: 1, suit: 'dots' },
  { kind: 'honor', honorId: 'redDragon' },
  { kind: 'num', value: 2, suit: 'dots' },
  { kind: 'honor', honorId: 'greenDragon' },
];

describe('TileFanComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TileFanComponent] });
  });

  function layoutFor(tiles: Tile[]) {
    const fixture = TestBed.createComponent(TileFanComponent);
    fixture.componentRef.setInput('tiles', tiles);
    fixture.detectChanges();
    return fixture.componentInstance['layout']();
  }

  it('builds one layout item per tile', () => {
    expect(layoutFor(FIVE_TILES).length).toBe(FIVE_TILES.length);
  });

  it('keeps the center tile upright and mirrors symmetric rotations', () => {
    const layout = layoutFor(FIVE_TILES);
    expect(layout[2].rotate).toBe('0deg');
    expect(layout[1].rotate).toBe('-11deg');
    expect(layout[3].rotate).toBe('11deg');
  });

  it('peaks the z-index at the center tile', () => {
    const layout = layoutFor(FIVE_TILES);
    expect(layout[2].zIndex).toBeGreaterThan(layout[0].zIndex);
    expect(layout[2].zIndex).toBeGreaterThan(layout[4].zIndex);
  });
});
