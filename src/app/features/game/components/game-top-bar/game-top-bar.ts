import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * The gameplay top bar: Exit + brand on the left, status chips (round /
 * reshuffles) in the center, and the streak pill + score on the right.
 * Pure presentation — round/score/etc. come in as inputs, `exit` goes out.
 */
@Component({
  selector: 'app-game-top-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-top-bar.html',
  styleUrl: './game-top-bar.css',
  host: { class: 'gtop' },
})
export class GameTopBarComponent {
  readonly round = input(1);
  readonly reshuffles = input(0);
  readonly maxReshuffles = input(3);
  readonly streak = input(0);
  readonly score = input(0);
  readonly exit = output<void>();

  /** Score is shown with thousands separators (matches the leaderboard). */
  protected readonly scoreLabel = computed(() => this.score().toLocaleString('en-US'));
}
