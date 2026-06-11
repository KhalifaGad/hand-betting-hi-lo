import { TestBed } from '@angular/core/testing';
import { HistoryEntry } from '../../models/game-view.model';
import { HistoryStripComponent } from './history-strip';

const ENTRIES: HistoryEntry[] = [
  { hand: [{ kind: 'num', value: 8, suit: 'bamboo' }], total: 11, dir: 'higher', result: 'win' },
  { hand: [{ kind: 'honor', id: 'white' }], total: 11, dir: 'lower', result: 'lose' },
  { hand: [{ kind: 'num', value: 5, suit: 'dots' }], total: 7, dir: 'lower', result: 'push' },
];

describe('HistoryStripComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HistoryStripComponent] });
  });

  function create(entries: HistoryEntry[] = ENTRIES) {
    const fixture = TestBed.createComponent(HistoryStripComponent);
    fixture.componentRef.setInput('entries', entries);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders one card per entry, in the order given', () => {
    const host = create();
    const cards = host.querySelectorAll('.hcard');
    expect(cards.length).toBe(3);
    expect(cards[0].classList.contains('won')).toBe(true);
    expect(cards[1].classList.contains('lost')).toBe(true);
    expect(cards[2].classList.contains('push')).toBe(true);
  });

  it('maps the result to WON / LOST / PUSH and shows the direction', () => {
    const cards = create().querySelectorAll('.hcard');
    expect(cards[0].querySelector('.res')?.textContent?.trim()).toBe('WON');
    expect(cards[1].querySelector('.res')?.textContent?.trim()).toBe('LOST');
    expect(cards[2].querySelector('.res')?.textContent?.trim()).toBe('PUSH');
    expect(cards[0].querySelector('.hbet')?.textContent).toContain('higher');
  });

  it('pluralizes the hand count and shows an empty state with no entries', () => {
    expect(create().querySelector('.hk')?.textContent).toContain('3 hands');
    const empty = create([]);
    expect(empty.querySelector('.hcard')).toBeNull();
    expect(empty.querySelector('.hist-empty')).not.toBeNull();
    expect(empty.querySelector('.hk')?.textContent).toContain('0 hands');
  });
});
