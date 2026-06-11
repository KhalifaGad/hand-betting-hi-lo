import { TestBed } from '@angular/core/testing';
import { LeaderboardEntry } from '@features/landing/models/leaderboard.model';
import { LeaderboardComponent } from './leaderboard';

const ENTRIES: LeaderboardEntry[] = [
  { rank: 1, label: 'Today', detail: '28-hand streak', score: 24850 },
  { rank: 2, label: 'Yesterday', detail: 'no reshuffle run', score: 21300 },
  { rank: 3, label: 'Jun 5', detail: 'held the green dragon', score: 18940 },
];

describe('LeaderboardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LeaderboardComponent] });
  });

  function create(entries: LeaderboardEntry[] = ENTRIES) {
    const fixture = TestBed.createComponent(LeaderboardComponent);
    fixture.componentRef.setInput('entries', entries);
    fixture.componentRef.setInput('gamesPlayed', 12);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one row per entry', () => {
    const host = create().nativeElement as HTMLElement;
    expect(host.querySelectorAll('li.row').length).toBe(ENTRIES.length);
  });

  it('gives the rank-1 row the "first" class and a trophy; others get neither', () => {
    const rows = (create().nativeElement as HTMLElement).querySelectorAll('li.row');
    expect(rows[0].classList.contains('first')).toBe(true);
    expect(rows[0].querySelector('.trophy')).not.toBeNull();
    expect(rows[1].classList.contains('first')).toBe(false);
    expect(rows[1].querySelector('.trophy')).toBeNull();
  });

  it('emits (cleared) when the clear button is clicked', () => {
    const fixture = create();
    let emitted = false;
    fixture.componentInstance.cleared.subscribe(() => (emitted = true));
    (fixture.nativeElement.querySelector('.reset') as HTMLButtonElement).click();
    expect(emitted).toBe(true);
  });

  it('formats scores with thousands separators', () => {
    expect(create().componentInstance['format'](24850)).toBe('24,850');
  });

  describe('empty state', () => {
    function createEmpty() {
      const fixture = TestBed.createComponent(LeaderboardComponent);
      fixture.componentRef.setInput('entries', [] as LeaderboardEntry[]);
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it('renders five placeholder rows with the first-run hint and no clear button', () => {
      const host = createEmpty();
      expect(host.querySelectorAll('li.row').length).toBe(5);
      expect(host.querySelector('.badge')?.textContent?.trim()).toBe('New');
      expect(host.querySelector('.nm')?.textContent).toContain('Your first run lands here');
      expect(host.querySelectorAll('.ph-line').length).toBeGreaterThan(0);
      expect(host.querySelector('.reset')).toBeNull();
      expect(host.textContent).toContain('Nothing here yet');
    });
  });
});
