import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Tile } from '@core';
import { MahjongTileComponent, PointerParallaxDirective } from '@shared';

interface FanPos {
  translate: string;
  rotate: string;
  zIndex: number;
}

interface FanItem extends FanPos {
  tile: Tile;
}

/**
 * Decorative fanned hand for the landing hero. Lays the shared tile out in an
 * arc and floats it gently; the cursor parallax is handled by the reusable
 * {@link PointerParallaxDirective} on the inner wrapper. Non-interactive.
 */
@Component({
  selector: 'app-tile-fan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MahjongTileComponent, PointerParallaxDirective],
  templateUrl: './tile-fan.html',
  styleUrl: './tile-fan.css',
  host: { class: 'fan' },
})
export class TileFanComponent {
  readonly tiles = input.required<Tile[]>();
  readonly size = input(108);
  readonly caption = input('Your opening hand');

  /** Rotation per step from center; horizontal spread & arc lift are CSS
      variables (`--fan-spread` / `--fan-lift`) so they shrink responsively. */
  private readonly rotStep = 11;

  /** Precomputed tile + arc position, recomputed only when the hand changes. */
  protected readonly layout = computed<FanItem[]>(() =>
    this.tiles().map((tile, index) => ({ tile, ...this.position(index) })),
  );

  private position(index: number): FanPos {
    const offsetFromCenter = index - (this.tiles().length - 1) / 2;
    const absOffset = Math.abs(offsetFromCenter);
    return {
      // spread/lift come from CSS vars so the fan can narrow on small screens
      translate:
        `calc(-50% + ${offsetFromCenter} * var(--fan-spread, 80px)) ` +
        `calc(-50% + ${absOffset} * var(--fan-lift, 13px) - 6px)`,
      rotate: `${offsetFromCenter * this.rotStep}deg`,
      zIndex: 10 - absOffset,
    };
  }
}
