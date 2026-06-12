import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Tile } from '@core';
import { HONOR_META, NUM_CN, PIP, suitLabel } from './tile-presentation';

type TileMode = 'dots' | 'bamboo' | 'chars' | 'dragon' | 'wind';

/**
 * The single Mahjong tile renderer used everywhere (hand, history, value
 * board, landing fan). Everything scales off `size` (the tile width in px)
 * so one component renders at any scale. Pure presentation — no game logic.
 *
 * Render kinds are a deliberately CLOSED set (3 suits + 2 honor styles) — the
 * full Mahjong vocabulary is fixed, so the `mode` switch is intentional rather
 * than a strategy registry. New per-mode data still lives in `tile-presentation`.
 */
@Component({
  selector: 'app-mahjong-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mahjong-tile.html',
  styleUrl: './mahjong-tile.css',
  host: {
    class: 'gtile',
    role: 'img',
    '[attr.aria-label]': 'ariaLabel()',
    '[style.--tw.px]': 'size()',
  },
})
export class MahjongTileComponent {
  /** The tile to render. */
  readonly tile = input.required<Tile>();
  /** Tile width in px; every inner dimension scales off it. */
  readonly size = input(118);
  /** Show the dynamic value badge (honors only). */
  readonly showBadge = input(false);
  /** The value displayed in the badge. */
  readonly badgeValue = input<number>();

  protected readonly mode = computed<TileMode>(() => {
    const tile = this.tile();
    if (tile.kind === 'honor') {
      return HONOR_META[tile.honorId].type === 'dragon' ? 'dragon' : 'wind';
    }
    return tile.suit;
  });

  /** Honor metadata, or null for numbered tiles. */
  protected readonly honor = computed(() => {
    const tile = this.tile();
    return tile.kind === 'honor' ? HONOR_META[tile.honorId] : null;
  });

  /** Chinese numeral for the character suit. */
  protected readonly numeral = computed(() => {
    const tile = this.tile();
    return tile.kind === 'num' ? NUM_CN[tile.value] : '';
  });

  /** 3×3 pip occupancy for dots / bamboo suits. */
  protected readonly pips = computed<readonly boolean[]>(() => {
    const tile = this.tile();
    return tile.kind === 'num' ? PIP[tile.value] : [];
  });

  protected readonly isOne = computed(() => {
    const tile = this.tile();
    return tile.kind === 'num' && tile.value === 1;
  });

  protected readonly showBadgeValue = computed(
    () => this.showBadge() && this.tile().kind === 'honor' && this.badgeValue() != null,
  );

  protected readonly ariaLabel = computed(() => {
    const tile = this.tile();
    if (tile.kind === 'honor') {
      const name = HONOR_META[tile.honorId].name;
      return this.showBadgeValue() ? `${name}, value ${this.badgeValue()}` : name;
    }
    return `${tile.value} of ${suitLabel(tile.suit)}`;
  });
}
