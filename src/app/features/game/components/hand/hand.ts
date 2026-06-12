import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { Tile } from '@core';
import { MahjongTileComponent } from '@shared';
import { CountPopDirective } from '../count-pop.directive';

type Phase = 'idle' | 'leaving' | 'entering';

/**
 * Center-stage hand: the current tiles + total, with a sequential leave → enter
 * choreography and a win/lose glow folded into the enter's tail (the cards land
 * already flashing, rather than pulsing after a full stop).
 *
 * The displayed tiles AND total are buffered: the old hand + old total stay on
 * screen through the leave/enter, then the total flips and `(revealed)` fires at
 * one coherent "reveal" moment — a hair before the cards fully settle — so the
 * number, the cards, and the colour all land together and betting re-enables
 * promptly. The leave→enter handoff is driven by counting `animationend` events
 * (never keyframe names); the reveal is a short timer so it can fire mid-settle.
 * The resting state always equals the inputs, so reduced-motion / SSR / tests
 * land the right frame without any beat completing.
 */
@Component({
  selector: 'app-hand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MahjongTileComponent, CountPopDirective],
  templateUrl: './hand.html',
  styleUrl: './hand.css',
  host: {
    class: 'hand-stage',
    '(animationend)': 'onLeaveEnd()',
  },
})
export class HandComponent {
  readonly hand = input<Tile[]>([]);
  readonly total = input(0);
  /** Win/lose to glow as the new hand lands (null = no glow). */
  readonly flash = input<'win' | 'lose' | null>(null);
  /** Fires as the new hand settles into place, so the container can re-enable betting. */
  readonly revealed = output<void>();

  /** Tiles on the table — lags `hand()` during the leave beat. */
  protected readonly display = signal<Tile[]>([]);
  /** Total shown — flips to the new value at the reveal moment, not on bet. */
  protected readonly displayTotal = signal(0);
  protected readonly phase = signal<Phase>('idle');

  /** Per-phase stagger between tiles, in seconds. */
  private static readonly STAGGER: Record<Phase, number> = { idle: 0, leaving: 0.04, entering: 0.06 };
  /** Reveal fires this long into the enter beat — a hair before full settle. */
  private static readonly REVEAL_MS = 320;

  private pending: Tile[] | null = null;
  private remaining = 0;
  private revealTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
    let first = true;
    effect(() => {
      const next = this.hand();
      untracked(() => {
        this.clearTimer();
        if (first) {
          first = false;
          this.display.set(next);
          this.displayTotal.set(this.total());
          if (next.length && !this.reducedMotion()) {
            this.startEntering(next);
          }
          return;
        }
        if (this.reducedMotion()) {
          this.display.set(next);
          this.displayTotal.set(this.total());
          this.phase.set('idle');
          this.revealed.emit();
          return;
        }
        // sequence: leave the current hand out, then deal the next one in
        this.pending = next;
        this.remaining = this.display().length;
        if (this.remaining) {
          this.phase.set('leaving');
        } else {
          this.startEntering(next);
        }
      });
    });
  }

  protected delay(index: number): string {
    return `${index * HandComponent.STAGGER[this.phase()]}s`;
  }

  /** Counts leave-beat completions; once the last tile is out, deals the next in. */
  protected onLeaveEnd(): void {
    if (this.phase() !== 'leaving' || --this.remaining > 0) {
      return;
    }
    this.startEntering(this.pending ?? this.hand());
    this.pending = null;
  }

  private startEntering(tiles: Tile[]): void {
    this.display.set(tiles);
    this.phase.set(tiles.length ? 'entering' : 'idle');
    if (!tiles.length) {
      this.reveal();
      return;
    }
    this.revealTimer = setTimeout(() => this.reveal(), HandComponent.REVEAL_MS);
  }

  /** The single coherent reveal: total flips, betting re-enables, glow is mid-pulse. */
  private reveal(): void {
    this.clearTimer();
    this.displayTotal.set(this.total());
    this.revealed.emit();
  }

  private clearTimer(): void {
    if (this.revealTimer !== null) {
      clearTimeout(this.revealTimer);
      this.revealTimer = null;
    }
  }

  private reducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
