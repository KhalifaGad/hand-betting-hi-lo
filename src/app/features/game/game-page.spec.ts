import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { GamePageComponent } from './game-page';
import { GAME_SERVICE, GameService } from './services/game.service';

describe('GamePageComponent', () => {
  beforeEach(() => {
    // jsdom doesn't implement <dialog> modality — stub it for the overlay.
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });

    TestBed.configureTestingModule({
      imports: [GamePageComponent],
      providers: [provideRouter([])],
    });
  });

  function create(): {
    fixture: ComponentFixture<GamePageComponent>;
    host: HTMLElement;
    service: GameService;
  } {
    const fixture = TestBed.createComponent(GamePageComponent);
    fixture.detectChanges();
    const service = fixture.debugElement.injector.get(GAME_SERVICE);
    return { fixture, host: fixture.nativeElement as HTMLElement, service };
  }

  it('renders the rails, the hand and the bet controls from the mock view', () => {
    const { host } = create();
    expect(host.querySelector('app-game-top-bar')).not.toBeNull();
    expect(host.querySelector('app-deck-panel')).not.toBeNull();
    expect(host.querySelector('app-hand')).not.toBeNull();
    expect(host.querySelectorAll('app-bet-controls .betbtn').length).toBe(2);
    expect(host.querySelectorAll('.rail.right app-tile-values-board .vrow').length).toBe(7);
    expect(host.querySelector('app-game-drawer')).not.toBeNull();
  });

  it('delegates a bet-controls (bet) event to the service', () => {
    const { fixture, host, service } = create();
    const bet = vi.spyOn(service, 'bet');
    (host.querySelector('app-bet-controls .betbtn.higher') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(bet).toHaveBeenCalledWith('higher');
  });

  it('maps the ← / → keys to lower / higher bets', () => {
    const { host, service } = create();
    const bet = vi.spyOn(service, 'bet');
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(bet.mock.calls.map((c) => c[0])).toEqual(['lower', 'higher']);
  });

  it('toggles the game-over summary preview with G', () => {
    const { fixture, host } = create();
    expect(host.querySelector('.go-reason')).toBeNull();

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    fixture.detectChanges();
    expect(host.querySelector('.go-reason')).not.toBeNull();

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));
    fixture.detectChanges();
    expect(host.querySelector('.go-reason')).toBeNull();
  });

  it('navigates home on exit', () => {
    const { fixture, host } = create();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    (host.querySelector('app-game-top-bar .exit') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(navigate).toHaveBeenCalledWith(['/']);
  });
});
