import { InjectionToken, Signal } from '@angular/core';
import { GameView } from '../models/game-view.model';

export type BetDirection = 'higher' | 'lower';

/**
 * The contract between the game UI and the game logic. Components depend on
 * this interface (via {@link GAME_SERVICE}) — never a concrete class — so the
 * mock and the owner's real rules implementation are freely swappable.
 */
export interface GameService {
  /** The current view-model the UI renders. */
  readonly view: Signal<GameView>;
  /** Place a higher/lower bet on the next hand. */
  bet(direction: BetDirection): void;
  /** Start a fresh game. */
  newGame(): void;
}

/** DI token for {@link GameService} — provided per the game feature. */
export const GAME_SERVICE = new InjectionToken<GameService>('GAME_SERVICE');
