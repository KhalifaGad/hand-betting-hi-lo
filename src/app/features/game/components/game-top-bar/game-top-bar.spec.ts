import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameTopBarComponent } from './game-top-bar';

describe('GameTopBarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GameTopBarComponent] });
  });

  function create(
    inputs: Partial<{
      round: number;
      reshuffles: number;
      maxReshuffles: number;
      streak: number;
      score: number;
    }> = {},
  ): { fixture: ComponentFixture<GameTopBarComponent>; host: HTMLElement } {
    const fixture = TestBed.createComponent(GameTopBarComponent);
    const ref = fixture.componentRef;
    ref.setInput('round', inputs.round ?? 8);
    ref.setInput('reshuffles', inputs.reshuffles ?? 1);
    ref.setInput('maxReshuffles', inputs.maxReshuffles ?? 3);
    ref.setInput('streak', inputs.streak ?? 3);
    ref.setInput('score', inputs.score ?? 1250);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('renders round, reshuffle ratio and a thousands-formatted score', () => {
    const { host } = create();
    expect(host.querySelector('.gtop-c')?.textContent).toContain('Round');
    expect(host.querySelector('.gtop-c')?.textContent).toContain('1/3');
    expect(host.querySelector('.scorebox b')?.textContent?.trim()).toBe('1,250');
  });

  it('dims the streak pill only when the streak is zero', () => {
    expect(create({ streak: 0 }).host.querySelector('.streak')?.classList.contains('idle')).toBe(
      true,
    );
    expect(create({ streak: 2 }).host.querySelector('.streak')?.classList.contains('idle')).toBe(
      false,
    );
  });

  it('emits (exit) when the Exit button is clicked', () => {
    const { fixture, host } = create();
    let exited = false;
    fixture.componentInstance.exit.subscribe(() => (exited = true));
    (host.querySelector('.exit') as HTMLButtonElement).click();
    expect(exited).toBe(true);
  });
});
