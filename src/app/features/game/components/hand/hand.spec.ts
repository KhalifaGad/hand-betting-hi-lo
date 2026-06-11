import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tile } from '@core';
import { HandComponent } from './hand';

const HAND: Tile[] = [
  { kind: 'honor', id: 'red' },
  { kind: 'num', value: 5, suit: 'dots' },
];

describe('HandComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HandComponent] });
  });

  function create(hand: Tile[] = HAND, total = 12) {
    const fixture = TestBed.createComponent(HandComponent);
    fixture.componentRef.setInput('hand', hand);
    fixture.componentRef.setInput('total', total);
    fixture.detectChanges();
    return fixture;
  }

  /** Fire one animationend with a given keyframe name, per tile on the table. */
  function endAnimation(fixture: ComponentFixture<HandComponent>, name: string): void {
    const host = fixture.nativeElement as HTMLElement;
    const count = host.querySelectorAll('app-mahjong-tile').length;
    for (let i = 0; i < count; i++) {
      const event = new Event('animationend');
      Object.defineProperty(event, 'animationName', { value: name });
      host.dispatchEvent(event);
    }
    fixture.detectChanges();
  }

  it('renders a tile per hand entry and the total', () => {
    const host = create().nativeElement as HTMLElement;
    expect(host.querySelectorAll('app-mahjong-tile').length).toBe(2);
    expect(host.querySelector('.total b')?.textContent?.trim()).toBe('12');
  });

  it('plays the entrance deal, then settles to the resting state', () => {
    const fixture = create();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-mahjong-tile')?.classList.contains('dealing')).toBe(true);
    endAnimation(fixture, 'hand-deal');
    expect(host.querySelector('app-mahjong-tile')?.classList.contains('dealing')).toBe(false);
  });

  it('flings the old hand out, then deals the new hand in on change', () => {
    const fixture = create();
    endAnimation(fixture, 'hand-deal'); // settle the entrance first
    const host = fixture.nativeElement as HTMLElement;

    fixture.componentRef.setInput('hand', [{ kind: 'num', value: 9, suit: 'chars' } as Tile]);
    fixture.detectChanges();
    expect(host.querySelector('app-mahjong-tile')?.classList.contains('leaving')).toBe(true);

    endAnimation(fixture, 'hand-leave'); // old hand finishes leaving → deal new in
    expect(host.querySelector('app-mahjong-tile')?.classList.contains('dealin')).toBe(true);

    endAnimation(fixture, 'hand-dealflip'); // new hand settles
    const tile = host.querySelector('app-mahjong-tile');
    expect(tile?.classList.contains('dealin')).toBe(false);
    expect(host.querySelectorAll('app-mahjong-tile').length).toBe(1);
  });

  it('applies the win/lose flash when flash is set', () => {
    const fixture = create();
    endAnimation(fixture, 'hand-deal');
    fixture.componentRef.setInput('flash', 'win');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-mahjong-tile')?.classList.contains('flash-win')).toBe(true);
  });
});
