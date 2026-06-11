import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { BetDirection } from '../../services/game.service';

/** A resolved bet to announce in the banner. */
export interface BetResult {
  dir: BetDirection;
  result: 'win' | 'lose' | 'push';
  /** Points won (win only); omitted when the model doesn't carry them. */
  points?: number;
}

/**
 * Floating result banner over the hand stage. Shows for ~1.7s when a new
 * result arrives, then fades. The resting state is hidden, so it's inert until
 * a bet resolves — and SSR / reduced-motion safe. Announced via `role="status"`.
 */
@Component({
  selector: 'app-result-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './result-banner.html',
  styleUrl: './result-banner.css',
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[class.show]': 'visible()',
    '[class.win]': "result()?.result === 'win'",
    '[class.lose]': "result()?.result === 'lose'",
    '[class.push]': "result()?.result === 'push'",
    '[attr.aria-hidden]': '!visible()',
  },
})
export class ResultBannerComponent {
  /** The latest resolved bet, or `null` while none is being shown. */
  readonly result = input<BetResult | null>(null);

  /** How long the banner stays up before fading (handoff: ~1.7s). */
  private static readonly VISIBLE_MS = 1700;

  protected readonly visible = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected readonly arrow = computed(() => (this.result()?.dir === 'higher' ? '▲' : '▼'));
  protected readonly label = computed(() => (this.result()?.dir === 'higher' ? 'Higher' : 'Lower'));
  protected readonly verb = computed(() => {
    switch (this.result()?.result) {
      case 'win':
        return 'Won';
      case 'lose':
        return 'Lost';
      default:
        return 'Push';
    }
  });

  constructor() {
    let seen = false;
    effect(() => {
      const value = this.result();
      // ignore the initial (null) value; only react to a freshly-set result
      if (!seen) {
        seen = true;
        return;
      }
      if (!value) {
        this.visible.set(false);
        return;
      }
      this.show();
    });
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  private show(): void {
    this.clear();
    this.visible.set(true);
    this.timer = setTimeout(() => this.visible.set(false), ResultBannerComponent.VISIBLE_MS);
  }

  private clear(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
