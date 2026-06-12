import { inject, Injectable, signal } from '@angular/core';
import { LeaderboardEntry } from '../models/leaderboard.model';
import { GAME_RESULT_REPOSITORY, GameRun } from '@core';

/**
 * Source of the player's personal best runs for the landing page. Starts empty
 * (the board renders its empty state) — the owner wires real on-device
 * persistence later without touching the page or the (dumb) LeaderboardComponent.
 */
@Injectable() 
export class LeaderboardService {
  private readonly gameResultRepository = inject(GAME_RESULT_REPOSITORY);

  private readonly entriesState = signal<LeaderboardEntry[]>(this.getEntries());

  readonly entries = this.entriesState.asReadonly();

  readonly gamesPlayed = signal(this.gameResultRepository.count());

  clear(): void {
    this.gameResultRepository.clear();
    this.entriesState.set([]);
    this.gamesPlayed.set(0);
  }

  private getEntries(): LeaderboardEntry[] {
    const runs = this.gameResultRepository.topRuns(5);
    return runs.map((run, index) => this.toEntry(run, index + 1));
  }

  private toEntry(run: GameRun, rank: number): LeaderboardEntry {
    return {
      rank,
      label: this.dateLabel(new Date(run.date)),
      detail: this.runDetail(run),
      score: run.score,
    };
  }

  /**
   * A characterful one-liner chosen by the run's standout stat — a hot streak, a
   * clutch multi-reshuffle survival, a clean single-deck run, or sheer longevity.
   * Deterministic: the same run always renders the same phrase.
   */
  private runDetail(run: GameRun): string {
    // Pick a phrasing variant from the run itself so wording varies but is stable.
    const variant = (options: string[]): string => options[run.hands % options.length];

    if (run.bestStreak >= 8) {
      return variant([`🔥 ${run.bestStreak}-win streak`, `${run.bestStreak} straight`, `unstoppable · ${run.bestStreak}×`]);
    }
    if (run.bestStreak >= 4) {
      return variant([`${run.bestStreak}-win streak`, `${run.bestStreak} in a row`, `streak of ${run.bestStreak}`]);
    }
    if (run.reshuffles >= 2) {
      return variant([`clutch · ${run.reshuffles} reshuffles`, `survived ${run.reshuffles} reshuffles`, `${run.hands} hands, ${run.reshuffles} decks`]);
    }
    if (run.reshuffles === 0) {
      return variant([`single deck`, `no reshuffles`, `clean run`]);
    }
    return variant([`${run.hands} hands deep`, `lasted ${run.hands} hands`, `${run.hands}-hand run`]);
  }

  private dateLabel(date: Date): string {
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
}
