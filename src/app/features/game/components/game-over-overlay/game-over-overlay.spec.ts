import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameOver } from '../../models/game-view.model';
import { GameOverOverlayComponent } from './game-over-overlay';

const DATA: GameOver = {
  reason: 'West Wind reached 10',
  finalScore: 24850,
  hands: 18,
  bestStreak: 7,
  isHighScore: true,
};

describe('GameOverOverlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GameOverOverlayComponent] });
  });

  function create(): {
    fixture: ComponentFixture<GameOverOverlayComponent>;
    dialog: HTMLDialogElement;
  } {
    const fixture = TestBed.createComponent(GameOverOverlayComponent);
    fixture.componentRef.setInput('data', null);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    // jsdom doesn't implement showModal/close — stub them and reflect `open`.
    dialog.showModal = vi.fn(() => {
      dialog.open = true;
    });
    dialog.close = vi.fn(() => {
      dialog.open = false;
    });
    return { fixture, dialog };
  }

  it('opens the dialog when data is set and closes it when cleared', () => {
    const { fixture, dialog } = create();
    fixture.componentRef.setInput('data', DATA);
    fixture.detectChanges();
    expect(dialog.showModal).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('data', null);
    fixture.detectChanges();
    expect(dialog.close).toHaveBeenCalledTimes(1);
  });

  it('renders the reason, formatted score, stats and the high-score badge', () => {
    const { fixture, dialog } = create();
    fixture.componentRef.setInput('data', DATA);
    fixture.detectChanges();
    expect(dialog.querySelector('.go-reason')?.textContent?.trim()).toBe('West Wind reached 10');
    expect(dialog.querySelector('.go-score b')?.textContent?.trim()).toBe('24,850');
    expect(dialog.querySelector('.go-badge')).not.toBeNull();
    expect(dialog.querySelectorAll('.go-stats .st b')[0].textContent?.trim()).toBe('18');
  });

  it('hides the high-score badge when isHighScore is false', () => {
    const { fixture, dialog } = create();
    fixture.componentRef.setInput('data', { ...DATA, isHighScore: false });
    fixture.detectChanges();
    expect(dialog.querySelector('.go-badge')).toBeNull();
  });

  it('emits (playAgain) and (exit) from the buttons', () => {
    const { fixture, dialog } = create();
    fixture.componentRef.setInput('data', DATA);
    fixture.detectChanges();
    let played = false;
    let exited = false;
    fixture.componentInstance.playAgain.subscribe(() => (played = true));
    fixture.componentInstance.exit.subscribe(() => (exited = true));
    (dialog.querySelector('.gobtn.primary') as HTMLButtonElement).click();
    (dialog.querySelector('.gobtn.ghost') as HTMLButtonElement).click();
    expect(played).toBe(true);
    expect(exited).toBe(true);
  });
});
