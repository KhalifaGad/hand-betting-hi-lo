import { HonorId, Tile } from '@core';

/** A row on the tile-values board (one per honor tile). */
export interface HonorValue {
  id: HonorId;
  name: string;
  glyph: string;
  value: number;
  danger: boolean;
}

/** A resolved previous hand shown in the history strip. */
export interface HistoryEntry {
  hand: Tile[];
  total: number;
  dir: 'higher' | 'lower';
  result: 'win' | 'lose' | 'push';
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
  honors: HonorValue[];
  history: HistoryEntry[];
  resolving: boolean;
  gameOver: GameOver | null;
}
