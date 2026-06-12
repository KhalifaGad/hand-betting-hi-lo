import { HonorId, Tile } from '@core';

/**
 * One row on the tile-values board: a single honor TYPE plus the live roster
 * of every physical copy of it in play. `values` carries one value (0–10) per
 * copy and GROWS on reshuffle (each reshuffle merges a fresh deck in), so the
 * board renders `values.length` markers and adapts to any `COPIES_PER_HONOR`.
 */
export interface HonorDistribution {
  honorId: HonorId;
  name: string;
  glyph: string;
  /** One value (0–10) per live copy of this honor type; length grows on reshuffle. */
  values: number[];
}

export type RoundResult = 'win' | 'lose' | 'push';

/** A resolved previous hand shown in the history strip. */
export interface HistoryEntry {
  hand: Tile[];
  total: number;
  dir: 'higher' | 'lower';
  result: RoundResult;
}

/** End-of-game summary, or `null` while play continues. */
export interface GameOver {
  reason: string;
  finalScore: number;
  hands: number;
  bestStreak: number;
  isHighScore: boolean;
}

/**
 * The full view-model the game UI renders. The rules that produce these
 * numbers are the owner's responsibility — the UI only renders state.
 */
export interface GameView {
  hand: Tile[];
  total: number;
  drawCount: number;
  discardCount: number;
  reshuffles: number;
  maxReshuffles: number;
  round: number;
  score: number;
  streak: number;
  honors: HonorDistribution[];
  history: HistoryEntry[];
  gameOver: GameOver | null;
}
