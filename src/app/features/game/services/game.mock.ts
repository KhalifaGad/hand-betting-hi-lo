import { inject, Injectable, signal } from '@angular/core';
import { GAME_CONFIG, HonorId } from '@core';
import { HONOR_META } from '@shared';
import { GameView, HonorValue } from '../models/game-view.model';
import { BetDirection, GameService } from './game.service';

/**
 * Placeholder game logic so the UI renders before the owner implements the
 * real rules. Emits a believable mid-game snapshot; the mutating methods are
 * intentionally inert stubs — the owner replaces this class entirely.
 */
@Injectable()
export class MockGameService implements GameService {
  private readonly config = inject(GAME_CONFIG);

  private readonly state = signal<GameView>(this.seed());
  readonly view = this.state.asReadonly();

  bet(_direction: BetDirection): void {
    // TODO(owner): resolve the bet — compare totals, update score/streak,
    // drift honor values ±1, push to history, and detect game over.
  }

  newGame(): void {
    // TODO(owner): build and shuffle a fresh deck, deal the opening hand.
    this.state.set(this.seed());
  }

  reset(): void {
    // TODO(owner): clear all state back to a brand-new game.
    this.state.set(this.seed());
  }

  /** A static, believable snapshot purely so the UI has something to render. */
  private seed(): GameView {
    const seededValues: Record<HonorId, number> = {
      red: 7,
      green: 6,
      white: 5,
      E: 5,
      S: 4,
      W: 8,
      N: 3,
    };
    const honors: HonorValue[] = (Object.keys(HONOR_META) as HonorId[]).map((id) => ({
      id,
      name: HONOR_META[id].name,
      glyph: HONOR_META[id].glyph,
      value: seededValues[id],
      danger: this.isDanger(seededValues[id]),
    }));

    return {
      hand: [
        { kind: 'honor', id: 'red' },
        { kind: 'num', value: 5, suit: 'dots' },
      ],
      total: 12,
      drawCount: 41,
      discardCount: 13,
      reshuffles: 1,
      maxReshuffles: this.config.maxReshuffles,
      round: 8,
      score: 1250,
      streak: 3,
      honors,
      history: [],
      resolving: false,
      gameOver: null,
    };
  }

  private isDanger(value: number): boolean {
    return value <= this.config.dangerLow || value >= this.config.dangerHigh;
  }
}
