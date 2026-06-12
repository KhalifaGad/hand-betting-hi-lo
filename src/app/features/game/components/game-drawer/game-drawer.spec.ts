import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HonorDistribution } from '../../models/game-view.model';
import { GameDrawerComponent } from './game-drawer';

const HONORS: HonorDistribution[] = [
  { honorId: 'redDragon', name: 'Red Dragon', glyph: '中', values: [5, 6, 6] },
  { honorId: 'westWind', name: 'West Wind', glyph: '西', values: [5, 8, 6] },
  { honorId: 'northWind', name: 'North Wind', glyph: '北', values: [5, 4, 4] },
];

describe('GameDrawerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GameDrawerComponent] });
  });

  function create(): { fixture: ComponentFixture<GameDrawerComponent>; host: HTMLElement } {
    const fixture = TestBed.createComponent(GameDrawerComponent);
    fixture.componentRef.setInput('honors', HONORS);
    fixture.componentRef.setInput('history', []);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('starts collapsed and counts the at-risk honors on the trigger', () => {
    const { host } = create();
    expect(host.querySelector('.sheet')?.classList.contains('open')).toBe(false);
    expect(host.querySelector('.trigger .risk')?.textContent).toContain('1 at risk');
  });

  it('opens the sheet from the trigger and closes it from the close button', () => {
    const { fixture, host } = create();
    (host.querySelector('.trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.querySelector('.sheet')?.classList.contains('open')).toBe(true);
    expect(host.querySelector('.trigger')).toBeNull();

    (host.querySelector('.close') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.querySelector('.sheet')?.classList.contains('open')).toBe(false);
  });

  it('defaults to the values tab and switches to history', () => {
    const { fixture, host } = create();
    (host.querySelector('.trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.querySelector('app-tile-values-board')).not.toBeNull();
    expect(host.querySelector('app-history-strip')).toBeNull();

    const historyTab = [...host.querySelectorAll<HTMLButtonElement>('.seg button')].find(
      (b) => b.textContent?.trim() === 'History',
    );
    historyTab?.click();
    fixture.detectChanges();
    expect(host.querySelector('app-history-strip')).not.toBeNull();
    expect(host.querySelector('app-tile-values-board')).toBeNull();
  });

  it('marks the closed sheet inert and hidden from assistive tech', () => {
    const { host } = create();
    const sheet = host.querySelector('.sheet') as HTMLElement;
    expect(sheet.getAttribute('aria-hidden')).toBe('true');
    expect(sheet.hasAttribute('inert')).toBe(true);
  });
});
