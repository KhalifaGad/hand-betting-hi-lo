import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';

/**
 * Centered "♺ Reshuffling deck" toast. Imperative: the container calls
 * `pulse()` when the deck reshuffles, and the toast shows briefly then fades.
 * Resting state is hidden, so it's inert until invoked. Announced politely.
 */
@Component({
  selector: 'app-reshuffle-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{ message() }}',
  styleUrl: './reshuffle-toast.css',
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[class.show]': 'visible()',
    '[attr.aria-hidden]': '!visible()',
  },
})
export class ReshuffleToastComponent {
  readonly message = input('♺ Reshuffling deck');

  /** How long the toast stays up (handoff: ~850ms). */
  private static readonly VISIBLE_MS = 850;

  protected readonly visible = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  /** Flash the toast. Called by the container on a reshuffle. */
  pulse(): void {
    this.clear();
    this.visible.set(true);
    this.timer = setTimeout(() => this.visible.set(false), ReshuffleToastComponent.VISIBLE_MS);
  }

  private clear(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
