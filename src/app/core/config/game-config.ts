import { InjectionToken } from '@angular/core';

/**
 * Tunable game rules. Centralized so rule-derived copy (landing) and the game
 * logic/UI read the same numbers instead of duplicating magic constants.
 * The owner implements the rules; these values define them in one place.
 */
export interface GameConfig {
  /** Reshuffles allowed before bust. */
  maxReshuffles: number;
  /** Starting value of every honor tile. */
  honorStart: number;
  /** An honor value at or below this is in danger. */
  dangerLow: number;
  /** An honor value at or above this is in danger. */
  dangerHigh: number;
  /** Honor bust thresholds (game over when a value hits either). */
  bustLow: number;
  bustHigh: number;
  /** Points awarded per win, multiplied by the current streak. */
  scorePerStreak: number;
}

/** Default rules, matching the design handoff. */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  maxReshuffles: 3,
  honorStart: 5,
  dangerLow: 2,
  dangerHigh: 8,
  bustLow: 0,
  bustHigh: 10,
  scorePerStreak: 100,
};

/** DI token so the config can be overridden per app/test. */
export const GAME_CONFIG = new InjectionToken<GameConfig>('GAME_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_GAME_CONFIG,
});
