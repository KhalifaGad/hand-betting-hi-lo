import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeckPanelComponent } from './deck-panel';

describe('DeckPanelComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DeckPanelComponent] });
  });

  function create(
    inputs: Partial<{
      drawCount: number;
      discardCount: number;
      reshuffles: number;
      maxReshuffles: number;
    }> = {},
  ): { fixture: ComponentFixture<DeckPanelComponent>; host: HTMLElement } {
    const fixture = TestBed.createComponent(DeckPanelComponent);
    const ref = fixture.componentRef;
    ref.setInput('drawCount', inputs.drawCount ?? 41);
    ref.setInput('discardCount', inputs.discardCount ?? 13);
    ref.setInput('reshuffles', inputs.reshuffles ?? 1);
    ref.setInput('maxReshuffles', inputs.maxReshuffles ?? 3);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('shows the draw and discard counts', () => {
    const { host } = create();
    expect(host.querySelector('.pile.draw .n')?.textContent?.trim()).toBe('41');
    expect(host.querySelector('.pile.discard .n')?.textContent?.trim()).toBe('13');
  });

  it('flags the draw pile low (gold) only at or below the threshold', () => {
    expect(create({ drawCount: 6 }).host.querySelector('.pile.draw')?.classList.contains('low')).toBe(
      true,
    );
    expect(create({ drawCount: 7 }).host.querySelector('.pile.draw')?.classList.contains('low')).toBe(
      false,
    );
  });

  it('fills one pip per used reshuffle', () => {
    const { host } = create({ reshuffles: 2, maxReshuffles: 3 });
    const pips = host.querySelectorAll('.pips i');
    expect(pips.length).toBe(3);
    expect([...pips].filter((p) => p.classList.contains('used')).length).toBe(2);
  });

  it('emits (reshuffled) when the reshuffle count increases', () => {
    const { fixture } = create({ reshuffles: 1 });
    let emitted = 0;
    fixture.componentInstance.reshuffled.subscribe(() => emitted++);
    fixture.componentRef.setInput('reshuffles', 2);
    fixture.detectChanges();
    expect(emitted).toBe(1);
  });

  it('does not emit (reshuffled) on the initial paint', () => {
    const fixture = TestBed.createComponent(DeckPanelComponent);
    let emitted = 0;
    fixture.componentInstance.reshuffled.subscribe(() => emitted++);
    fixture.componentRef.setInput('reshuffles', 1);
    fixture.detectChanges();
    expect(emitted).toBe(0);
  });
});
