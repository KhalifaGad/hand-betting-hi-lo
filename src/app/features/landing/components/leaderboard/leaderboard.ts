import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LeaderboardEntry } from '@features/landing/models/leaderboard.model';

/**
 * Personal best-runs panel. Rank #1 gets the gold treatment. When there are no
 * entries it renders an empty state (a "deal in" hint + skeleton rows).
 */
@Component({
  selector: 'app-leaderboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class LeaderboardComponent {
  readonly entries = input.required<LeaderboardEntry[]>();
  /** Total games played, shown as the panel badge. */
  readonly gamesPlayed = input(0);
  readonly cleared = output<void>();

  protected readonly isEmpty = computed(() => this.entries().length === 0);

  /** The five rank slots shown while the board is empty. */
  protected readonly placeholderRanks = [1, 2, 3, 4, 5] as const;

  protected format(score: number): string {
    return score.toLocaleString('en-US');
  }
}
