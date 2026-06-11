import { Injectable, signal } from '@angular/core';
import { LeaderboardEntry } from '../models/leaderboard.model';

/**
 * Source of the player's personal best runs for the landing page. Starts empty
 * (the board renders its empty state) — the owner wires real on-device
 * persistence later without touching the page or the (dumb) LeaderboardComponent.
 */
@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  // TODO(owner): load the player's saved runs from device storage.
  private readonly entriesState = signal<LeaderboardEntry[]>([]);

  /** Top personal runs, best first (empty until the owner populates them). */
  readonly entries = this.entriesState.asReadonly();

  /** Total games played (shown as the panel badge). */
  readonly gamesPlayed = signal(0).asReadonly();

  clear(): void {
    // TODO(owner): clear the saved runs from device storage.
  }
}
