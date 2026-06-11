import { TestBed } from '@angular/core/testing';
import { HonorValue } from '../../models/game-view.model';
import { TileValuesBoardComponent } from './tile-values-board';

const HONORS: HonorValue[] = [
  { id: 'red', name: 'Red Dragon', glyph: '中', value: 7, danger: false },
  { id: 'W', name: 'West Wind', glyph: '西', value: 8, danger: true },
];

describe('TileValuesBoardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TileValuesBoardComponent] });
  });

  function create(honors: HonorValue[] = HONORS) {
    const fixture = TestBed.createComponent(TileValuesBoardComponent);
    fixture.componentRef.setInput('honors', honors);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one row per honor with its value', () => {
    const host = create().nativeElement as HTMLElement;
    const rows = host.querySelectorAll('.vrow');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('.vval')?.textContent?.trim()).toBe('7');
  });

  it('marks danger rows and sets the fill width from the value', () => {
    const host = create().nativeElement as HTMLElement;
    const rows = host.querySelectorAll('.vrow');
    expect(rows[0].classList.contains('danger')).toBe(false);
    expect(rows[1].classList.contains('danger')).toBe(true);
    expect((rows[0].querySelector('.fill') as HTMLElement).style.width).toBe('70%');
  });

  it('floats a delta when a value changes', () => {
    const fixture = create();
    fixture.componentRef.setInput('honors', [
      { id: 'red', name: 'Red Dragon', glyph: '中', value: 8, danger: true },
      HONORS[1],
    ]);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const delta = host.querySelector('.vrow .delta');
    expect(delta).not.toBeNull();
    expect(delta?.classList.contains('up')).toBe(true);
    expect(delta?.textContent?.trim()).toBe('▲');
  });
});
