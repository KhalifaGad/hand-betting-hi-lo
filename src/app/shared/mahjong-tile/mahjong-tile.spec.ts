import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tile } from '@core';
import { MahjongTileComponent } from './mahjong-tile';

describe('MahjongTileComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MahjongTileComponent] });
  });

  function render(inputs: {
    tile: Tile;
    size?: number;
    showBadge?: boolean;
    badgeValue?: number;
  }): { fixture: ComponentFixture<MahjongTileComponent>; host: HTMLElement } {
    const fixture = TestBed.createComponent(MahjongTileComponent);
    const ref: ComponentRef<MahjongTileComponent> = fixture.componentRef;
    ref.setInput('tile', inputs.tile);
    if (inputs.size !== undefined) ref.setInput('size', inputs.size);
    if (inputs.showBadge !== undefined) ref.setInput('showBadge', inputs.showBadge);
    if (inputs.badgeValue !== undefined) ref.setInput('badgeValue', inputs.badgeValue);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('renders role="img" with an aria-label for a number tile', () => {
    const { host } = render({ tile: { kind: 'num', value: 5, suit: 'dots' } });
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('5 of Dots');
  });

  it('uses the honor name as the aria-label for an honor tile', () => {
    const { host } = render({ tile: { kind: 'honor', id: 'red' } });
    expect(host.getAttribute('aria-label')).toBe('Red Dragon');
  });

  it('shows the badge value and folds it into the aria-label when showBadge is set', () => {
    const { host } = render({ tile: { kind: 'honor', id: 'red' }, showBadge: true, badgeValue: 7 });
    expect(host.querySelector('.badge')?.textContent?.trim()).toBe('7');
    expect(host.getAttribute('aria-label')).toBe('Red Dragon, value 7');
  });

  it('never shows a badge on a numbered tile, even with showBadge', () => {
    const { host } = render({
      tile: { kind: 'num', value: 3, suit: 'bamboo' },
      showBadge: true,
      badgeValue: 9,
    });
    expect(host.querySelector('.badge')).toBeNull();
  });

  it('sets the --tw custom property from size', () => {
    const { host } = render({ tile: { kind: 'num', value: 1, suit: 'dots' }, size: 64 });
    expect(host.style.getPropertyValue('--tw')).toBe('64px');
  });
});
