import { TestBed } from '@angular/core/testing';
import { ReshuffleToastComponent } from './reshuffle-toast';

describe('ReshuffleToastComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ReshuffleToastComponent] });
  });

  it('is hidden at rest and shows the default message text', () => {
    const fixture = TestBed.createComponent(ReshuffleToastComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('show')).toBe(false);
    expect(host.textContent).toContain('Reshuffling deck');
  });

  it('shows on pulse() then auto-hides', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(ReshuffleToastComponent);
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;

      fixture.componentInstance.pulse();
      fixture.detectChanges();
      expect(host.classList.contains('show')).toBe(true);

      vi.advanceTimersByTime(850);
      fixture.detectChanges();
      expect(host.classList.contains('show')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
