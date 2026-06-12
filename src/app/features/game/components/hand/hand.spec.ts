import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tile } from '@core';
import { HandComponent } from './hand';

const HAND: Tile[] = [
  { kind: 'num', value: 5, suit: 'dots' },
  { kind: 'num', value: 3, suit: 'bamboo' },
];
const NEXT: Tile[] = [{ kind: 'num', value: 9, suit: 'chars' }];

/** Stub matchMedia so the reduced-motion branch is deterministic per test. */
function setReducedMotion(reduce: boolean): void {
  (globalThis as unknown as { matchMedia: (q: string) => MediaQueryList }).matchMedia = (q) =>
    ({ matches: reduce, media: q }) as MediaQueryList;
}

describe('HandComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HandComponent] });
    setReducedMotion(false);
  });

  afterEach(() => {
    delete (globalThis as unknown as { matchMedia?: unknown }).matchMedia;
  });

  function create(hand: Tile[] = HAND, total = 8) {
    const fixture = TestBed.createComponent(HandComponent);
    fixture.componentRef.setInput('hand', hand);
    fixture.componentRef.setInput('total', total);
    fixture.detectChanges();
    return fixture;
  }

  function endBeat(fixture: ComponentFixture<HandComponent>, count: number) {
    const host = fixture.nativeElement as HTMLElement;
    for (let i = 0; i < count; i++) {
      host.dispatchEvent(new Event('animationend', { bubbles: true }));
    }
    fixture.detectChanges();
  }

  function tileCount(fixture: ComponentFixture<HandComponent>): number {
    return (fixture.nativeElement as HTMLElement).querySelectorAll('app-mahjong-tile').length;
  }

  function totalText(fixture: ComponentFixture<HandComponent>): string {
    return (fixture.nativeElement as HTMLElement).querySelector('.total b')?.textContent?.trim() ?? '';
  }

  it('renders a tile per hand entry and the total', () => {
    const fixture = create();
    expect(tileCount(fixture)).toBe(2);
    expect(totalText(fixture)).toBe('8');
  });

  it('leaves, deals in, then reveals the new total a hair before settling', () => {
    vi.useFakeTimers();
    try {
      const fixture = create();
      vi.advanceTimersByTime(400); // let the initial entrance reveal fire
      fixture.detectChanges();

      let revealed = 0;
      fixture.componentInstance.revealed.subscribe(() => revealed++);

      fixture.componentRef.setInput('hand', NEXT);
      fixture.componentRef.setInput('total', 9);
      fixture.detectChanges();

      // leave beat: still showing the OLD hand and OLD total
      expect(tileCount(fixture)).toBe(2);
      expect(totalText(fixture)).toBe('8');
      expect(revealed).toBe(0);

      endBeat(fixture, 2); // leave done → deal the new hand in
      expect(tileCount(fixture)).toBe(1);
      expect(totalText(fixture)).toBe('8'); // total still buffered
      expect(revealed).toBe(0);

      vi.advanceTimersByTime(320); // reveal moment
      fixture.detectChanges();
      expect(totalText(fixture)).toBe('9'); // total flips with the landing
      expect(revealed).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('marks the entering tiles with the win glow class', () => {
    vi.useFakeTimers();
    try {
      const fixture = create();
      vi.advanceTimersByTime(400);
      fixture.componentRef.setInput('flash', 'win');
      fixture.componentRef.setInput('hand', NEXT);
      fixture.detectChanges();
      endBeat(fixture, 2); // leave → enter
      const tile = (fixture.nativeElement as HTMLElement).querySelector('app-mahjong-tile');
      expect(tile?.classList.contains('entering')).toBe(true);
      expect(tile?.classList.contains('win')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('swaps immediately and reveals without animation under reduced motion', () => {
    setReducedMotion(true);
    const fixture = create();
    let revealed = 0;
    fixture.componentInstance.revealed.subscribe(() => revealed++);

    fixture.componentRef.setInput('hand', NEXT);
    fixture.componentRef.setInput('total', 9);
    fixture.detectChanges();

    expect(tileCount(fixture)).toBe(1);
    expect(totalText(fixture)).toBe('9');
    expect(revealed).toBe(1);
  });
});
