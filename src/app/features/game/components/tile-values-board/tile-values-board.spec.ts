import { TestBed } from '@angular/core/testing';
import { HonorDistribution } from '../../models/game-view.model';
import { TileValuesBoardComponent } from './tile-values-board';

const HONORS: HonorDistribution[] = [
  { honorId: 'redDragon', name: 'Red Dragon', glyph: '中', values: [5, 6, 5, 6] },
  { honorId: 'westWind', name: 'West Wind', glyph: '西', values: [5, 8, 5, 6, 9] },
];

describe('TileValuesBoardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TileValuesBoardComponent] });
  });

  function create(honors: HonorDistribution[] = HONORS) {
    const fixture = TestBed.createComponent(TileValuesBoardComponent);
    fixture.componentRef.setInput('honors', honors);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one row per honor type with a dot per live copy', () => {
    const host = create().nativeElement as HTMLElement;
    const rows = host.querySelectorAll('.vrow');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelectorAll('.swarm .dot').length).toBe(4);
    expect(rows[1].querySelectorAll('.swarm .dot').length).toBe(5);
  });

  it('shows the ×N copy count for each type', () => {
    const host = create().nativeElement as HTMLElement;
    const rows = host.querySelectorAll('.vrow');
    expect(rows[0].querySelector('.count')?.textContent?.trim()).toBe('×4');
    expect(rows[1].querySelector('.count')?.textContent?.trim()).toBe('×5');
  });

  it('marks edge copies, flags the row danger, and reports the at-risk count', () => {
    const host = create().nativeElement as HTMLElement;
    const rows = host.querySelectorAll('.vrow');

    // Red Dragon: no copy in the edge band (≤2 / ≥8).
    expect(rows[0].classList.contains('danger')).toBe(false);
    expect(rows[0].querySelectorAll('.dot.edge').length).toBe(0);
    expect(rows[0].querySelector('.risk')?.textContent?.trim()).toBe('safe');

    // West Wind: two copies at 8 and 9 sit in the edge band.
    expect(rows[1].classList.contains('danger')).toBe(true);
    expect(rows[1].querySelectorAll('.dot.edge').length).toBe(2);
    expect(rows[1].querySelector('.risk.warn')?.textContent).toContain('2');
  });

  it('positions a marker horizontally by its value', () => {
    const host = create().nativeElement as HTMLElement;
    const firstDot = host.querySelector('.vrow .dot') as HTMLElement;
    // First Red Dragon copy is value 5 → 50% across the 0–10 scale.
    expect(firstDot.style.left).toBe('50%');
  });

  it('floats a delta and pulses the marker when a copy changes', () => {
    const fixture = create();
    fixture.componentRef.setInput('honors', [
      { honorId: 'redDragon', name: 'Red Dragon', glyph: '中', values: [5, 6, 5, 9] },
      HONORS[1],
    ]);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const delta = host.querySelector('.vrow .delta');
    expect(delta).not.toBeNull();
    expect(delta?.classList.contains('up')).toBe(true);
    expect(delta?.textContent?.trim()).toBe('▲');
    // The changed copy's core marker pulses.
    expect(host.querySelector('.vrow .dot .core.pulse')).not.toBeNull();
  });
});
