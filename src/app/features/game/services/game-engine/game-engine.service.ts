import { computed, inject, Injectable, signal } from '@angular/core';
import { GAME_CONFIG, HonorId } from '@core';
import { HONOR_META } from '@shared';
import { GameOver, GameView, HistoryEntry, RoundResult, HonorDistribution } from '../../models';
import { BetDirection, GameService } from '../game.service';
import { GameTile, HonorGameTile } from '@features/game/models/game-tile.model';
import { Scorer } from './scorer';
import { Deck } from './deck';
import { Scaler } from './scaler';

@Injectable()
export class GameEngineService implements GameService {
  private readonly config = inject(GAME_CONFIG);
  private readonly scorer = new Scorer(this.config);
  private readonly deck = new Deck(
    this.config, 
    () => crypto.randomUUID(),
  );
  private readonly scaler = new Scaler(this.config);

  private handsCount = signal<number>(0);
  private reshuffles = signal<number>(0);
  private round = signal<number>(1);
  private score = signal<number>(0);
  private streak = signal<number>(0);
  private bestStreak = signal<number>(0);
  private gameOver = signal<GameOver | null>(null);
  private discardPile = signal<GameTile[]>([]);
  private drawPile = signal<GameTile[]>(this.deck.shuffle(this.deck.createPile()));
  private currentHand = signal<GameTile[]>(this.draw());

  private allTiles = computed<GameTile[]>(() => [
    ...this.drawPile(),
    ...this.currentHand(),
    ...this.discardPile(),
  ]);
  
  private honors = computed<HonorDistribution[]>(() => {
    const honorTiles = this.allTiles().filter(
      (tile): tile is GameTile & { kind: 'honor' } => tile.kind === 'honor',
    );
    return (Object.keys(HONOR_META) as HonorId[]).map((honorId) => ({
      honorId,
      name: HONOR_META[honorId].name,
      glyph: HONOR_META[honorId].glyph,
      values: honorTiles.filter((tile) => tile.honorId === honorId).map((tile) => tile.value),
    }));
  });

  private history = signal<HistoryEntry[]>([]);

  readonly view = computed<GameView>(() => {
    return {
      hand: this.currentHand(),
      total: this.handTotal(this.currentHand()),
      drawCount: this.drawPile().length,
      discardCount: this.discardPile().length,
      reshuffles: this.reshuffles(),
      maxReshuffles: this.config.maxReshuffles,
      round: this.round(),
      score: this.score(),
      streak: this.streak(),
      history: this.history(),
      gameOver: this.gameOver(),
      honors: this.honors(),
    }
  });

  bet(direction: BetDirection): void {
    const currentHand = this.currentHand();
    const currentTotal = this.handTotal(currentHand);
    const nextHand = this.draw();
    const nextTotal = this.handTotal(nextHand);

    const roundResult = this.getRoundResult(currentTotal, nextTotal, direction);
    const scoreResult = this.scorer.apply(this.score(), roundResult, this.streak());
    this.score.set(scoreResult.score);
    this.streak.set(scoreResult.streak);
    this.bestStreak.update((prev) => Math.max(prev, scoreResult.streak));
    
    const scalerResult = this.scaler.apply(currentHand, roundResult);
    const updatedCurrentHand = currentHand.map((tile) => { 
      const scaledTile = scalerResult.hand.find((t) => t.id === tile.id);
      if (!scaledTile) return tile;
      return scaledTile;
    });
    this.discardPile.update((discardPile) => [...discardPile, ...updatedCurrentHand]);

    this.history.update((history) => [{
      hand: currentHand,
      total: currentTotal,
      dir: direction,
      result: roundResult,
    },
      ...history,
    ]);

    this.currentHand.set(nextHand);
    this.round.update((round) => round + 1);
    if (scalerResult.busted) {
      this.onBustedTileEndGame(scalerResult.busted);
    }
    this.onBetCompleted();
  }

  newGame(): void {
    this.reshuffles.set(0);
    this.handsCount.set(0);
    this.round.set(1);
    this.score.set(0);
    this.streak.set(0);
    this.discardPile.set([]);
    this.history.set([]);
    this.bestStreak.set(0);
    this.drawPile.set(this.deck.shuffle(this.deck.createPile()));
    this.currentHand.set(this.draw());
    this.gameOver.set(null);
  }

  private draw(): GameTile[] {
    const { hand, remaining } = this.deck.draw(this.drawPile(), this.config.handSize);
    this.drawPile.set(remaining);
    this.handsCount.update((prev) => prev + 1);
    return hand;
  }

  private onBetCompleted(): void { 
    const isDrawPileEmpty = this.drawPile().length === 0;
    if (!isDrawPileEmpty) {
      return;
    }

    if (this.reshuffles() >= this.config.maxReshuffles) { 
      alert('max reshuffles reached');
      this.gameOver.set({
        reason: 'max reshuffles reached',
        finalScore: this.score(),
        hands: this.handsCount(),
        bestStreak: this.bestStreak(),
        isHighScore: false, // TODO: inject previous high score
      });
      return;
    }

    this.reshuffle();
  }

  private reshuffle(): void { 
    const newPile = this.deck.createPile();
    const shuffledPile = this.deck.shuffle([...newPile, ...this.discardPile()]);
    this.drawPile.set(shuffledPile);
    this.discardPile.set([]);
    this.reshuffles.update((prev) => prev + 1);
  }

  private getRoundResult(currentTotal: number, nextTotal: number, direction: BetDirection): RoundResult {
    if (currentTotal === nextTotal) {
      return 'push'
    }

    if (direction === 'higher' && nextTotal > currentTotal) {
      return 'win';
    } else if (direction === 'lower' && nextTotal < currentTotal) {
      return 'win';
    } else {
      return 'lose';
    }
  }

  private handTotal(hand: GameTile[]): number {
    return hand.reduce((total, tile) => total + tile.value, 0);
  }

  private onBustedTileEndGame(busted: HonorGameTile): void { 
    const honorName = HONOR_META[busted.honorId].name;
    this.gameOver.set({
      reason: `${honorName} reached ${this.config.bustHigh}`,
      finalScore: this.score(),
      hands: this.handsCount(),
      bestStreak: this.bestStreak(),
      isHighScore: false, // TODO: inject previous high score
    });
  }
}
