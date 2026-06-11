import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CountPopDirective } from '../count-pop.directive';

/**
 * Left-rail deck panel: draw + discard pile counts and the reshuffle tracker.
 * The draw count turns gold when it runs low; the reshuffle pips fill gold as
 * reshuffles are spent. When the reshuffle count ticks up the panel shakes and
 * emits `reshuffled` so the container can raise the "♺ Reshuffling deck" toast.
 */
@Component({
  selector: 'app-deck-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CountPopDirective],
  templateUrl: './deck-panel.html',
  styleUrl: './deck-panel.css',
  host: {
    class: 'panel deck',
    '[class.shuffling]': 'shaking()',
    '(animationend)': 'onAnimationEnd($event)',
  },
})
export class DeckPanelComponent {
  readonly drawCount = input(0);
  readonly discardCount = input(0);
  readonly reshuffles = input(0);
  readonly maxReshuffles = input(3);
  /** Draw count is flagged "low" (gold) at or below this — a purely visual cue. */
  readonly lowThreshold = input(6);

  /** Raised when the reshuffle count increases (deck was refilled). */
  readonly reshuffled = output<void>();

  /** True for the duration of the shake animation. */
  protected readonly shaking = signal(false);

  /** Whether the draw count should glow gold. */
  protected readonly low = computed(() => this.drawCount() <= this.lowThreshold());

  /** Pip slots; each is "used" once its index falls within the reshuffle count. */
  protected readonly pips = computed(() =>
    Array.from({ length: this.maxReshuffles() }, (_, i) => i < this.reshuffles()),
  );

  /** True only after the first paint, so the seed value doesn't trigger FX. */
  private seen = false;
  private prevReshuffles = 0;

  constructor() {
    effect(() => {
      const next = this.reshuffles();
      if (this.seen && next > this.prevReshuffles) {
        this.reshuffled.emit();
        if (!this.reducedMotion()) {
          this.shaking.set(true);
        }
      }
      this.prevReshuffles = next;
      this.seen = true;
    });
  }

  /** Clear the shake only when the shake itself ends (count-pops bubble here too). */
  protected onAnimationEnd(event: AnimationEvent): void {
    if (event.animationName === 'deck-shake') {
      this.shaking.set(false);
    }
  }

  private reducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
