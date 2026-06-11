import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Tile } from '@core';
import { MahjongTileComponent } from '@shared';

type Phase = 'idle' | 'entrance' | 'leaving' | 'dealing';
type FlashClass = '' | 'flash-win' | 'flash-lose';

/**
 * Center-stage hand: the current tiles + total, and the deal/flip choreography.
 *
 * When the `hand` input changes it flings the outgoing tiles toward the discard
 * pile, then deals the new ones in (slide + flip). Phase transitions are driven
 * by `animationend` (not fixed timers), and the resting phase (`idle`, no anim
 * classes) is the default — so reduced-motion, SSR, and tests land the correct
 * face-up state without waiting on a timeline. A `flash` of `win`/`lose` pulses
 * a neon glow once the tiles settle.
 */
@Component({
  selector: 'app-hand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MahjongTileComponent],
  templateUrl: './hand.html',
  styleUrl: './hand.css',
  host: {
    class: 'hand-stage',
    '[class.resolving]': 'resolving()',
    '(animationend)': 'onAnimationEnd($event)',
  },
})
export class HandComponent {
  readonly hand = input<Tile[]>([]);
  readonly total = input(0);
  readonly resolving = input(false);
  /** Pulse the tiles win (green) / lose (red) once they've settled. */
  readonly flash = input<'win' | 'lose' | null>(null);

  /** Tiles currently on the table (may lag `hand` during the leave animation). */
  protected readonly tiles = signal<Tile[]>([]);
  protected readonly phase = signal<Phase>('idle');
  protected readonly flashClass = signal<FlashClass>('');

  /** Per-phase stagger between tiles, in seconds. */
  private static readonly STAGGER: Record<Phase, number> = {
    idle: 0,
    entrance: 0.09,
    leaving: 0.05,
    dealing: 0.1,
  };

  private pending: Tile[] | null = null;
  private remaining = 0;

  constructor() {
    let first = true;
    effect(() => {
      const next = this.hand();
      // React only to `hand` changes; read/write the other signals untracked so
      // settling the timeline (which sets `tiles`/`phase`) can't re-trigger this.
      untracked(() => {
        if (first) {
          first = false;
          this.tiles.set(next);
          if (next.length && !this.reducedMotion()) {
            this.remaining = next.length;
            this.phase.set('entrance');
          }
          return;
        }
        if (this.reducedMotion()) {
          this.tiles.set(next);
          this.phase.set('idle');
          return;
        }
        // fling the current hand out, then deal `next` in (see onAnimationEnd)
        this.pending = next;
        this.remaining = this.tiles().length;
        this.phase.set(this.remaining ? 'leaving' : 'dealing');
        if (!this.remaining) {
          this.beginDealing();
        }
      });
    });

    let firstFlash = true;
    effect(() => {
      const f = this.flash();
      untracked(() => {
        if (firstFlash) {
          firstFlash = false;
          return;
        }
        if (!f || this.reducedMotion()) {
          this.flashClass.set('');
          return;
        }
        this.flashClass.set(f === 'win' ? 'flash-win' : 'flash-lose');
      });
    });
  }

  protected delay(index: number): string {
    return `${index * HandComponent.STAGGER[this.phase()]}s`;
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    switch (event.animationName) {
      case 'hand-deal':
        if (this.phase() === 'entrance' && --this.remaining <= 0) {
          this.phase.set('idle');
        }
        break;
      case 'hand-leave':
        if (this.phase() === 'leaving' && --this.remaining <= 0) {
          this.beginDealing();
        }
        break;
      case 'hand-dealflip':
        if (this.phase() === 'dealing' && --this.remaining <= 0) {
          this.phase.set('idle');
        }
        break;
      case 'tile-flash-win':
      case 'tile-flash-lose':
        this.flashClass.set('');
        break;
    }
  }

  private beginDealing(): void {
    this.tiles.set(this.pending ?? this.hand());
    this.pending = null;
    this.remaining = this.tiles().length;
    this.phase.set(this.remaining ? 'dealing' : 'idle');
  }

  private reducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
