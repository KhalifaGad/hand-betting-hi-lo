import { TestBed } from '@angular/core/testing';
import { BetResult, ResultBannerComponent } from './result-banner';

describe('ResultBannerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ResultBannerComponent] });
  });

  /** Starts null (the resting state), then sets a result — matching real use. */
  function createThenSet(result: BetResult) {
    const fixture = TestBed.createComponent(ResultBannerComponent);
    fixture.componentRef.setInput('result', null);
    fixture.detectChanges();
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();
    return fixture;
  }

  it('is hidden at rest (no result)', () => {
    const fixture = TestBed.createComponent(ResultBannerComponent);
    fixture.componentRef.setInput('result', null);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('show')).toBe(false);
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows a win with points and the correct state class', () => {
    const fixture = createThenSet({ dir: 'higher', result: 'win', points: 400 });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('show')).toBe(true);
    expect(host.classList.contains('win')).toBe(true);
    expect(host.textContent).toContain('Higher');
    expect(host.textContent).toContain('Won');
    expect(host.textContent).toContain('+400');
  });

  it('labels a loss without points', () => {
    const host = createThenSet({ dir: 'lower', result: 'lose' }).nativeElement as HTMLElement;
    expect(host.classList.contains('lose')).toBe(true);
    expect(host.textContent).toContain('Lower');
    expect(host.textContent).toContain('Lost');
    expect(host.textContent).not.toContain('+');
  });

  it('auto-hides after the visible window elapses', () => {
    vi.useFakeTimers();
    try {
      const fixture = createThenSet({ dir: 'higher', result: 'win', points: 100 });
      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains('show')).toBe(true);
      vi.advanceTimersByTime(1700);
      fixture.detectChanges();
      expect(host.classList.contains('show')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
