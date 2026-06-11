import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { HonorId, Tile } from '@core';
import { MahjongTileComponent } from '@shared';
import { HonorValue } from '../../models/game-view.model';
import { CountPopDirective } from '../count-pop.directive';

/** Transient per-row flash shown when a value changes. */
interface RowFx {
  delta: '▲' | '▼';
  dir: 'up' | 'down';
}

/** A value-board row: the source honor plus a tile to render in the chip. */
interface ValueRow {
  honor: HonorValue;
  tile: Tile;
}

/**
 * Right-rail "Tile Values" board — one row per honor with a 0–10 track bar and
 * its current value. Rows in danger (≤ dangerLow / ≥ dangerHigh) go red. When a
 * value changes the bar slides (CSS), the number pops, and a ▲/▼ delta floats
 * up. Resting state carries no FX classes, so it's SSR / reduced-motion safe.
 */
@Component({
  selector: 'app-tile-values-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MahjongTileComponent, CountPopDirective],
  templateUrl: './tile-values-board.html',
  styleUrl: './tile-values-board.css',
  host: {
    class: 'values',
    '[class.panel]': '!embedded()',
    '[class.embedded]': 'embedded()',
  },
})
export class TileValuesBoardComponent {
  readonly honors = input<HonorValue[]>([]);
  /** When embedded (e.g. in the mobile drawer) it drops its own panel chrome + header. */
  readonly embedded = input(false);

  protected readonly rows = computed<ValueRow[]>(() =>
    this.honors().map((honor) => ({ honor, tile: { kind: 'honor', id: honor.id } })),
  );

  /** Active delta FX keyed by honor id (cleared after the float animation). */
  protected readonly fx = signal<Partial<Record<HonorId, RowFx>>>({});

  private readonly prev = new Map<HonorId, number>();
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private static readonly FX_MS = 1000;

  constructor() {
    let seen = false;
    effect(() => {
      const honors = this.honors();
      // Read/write `fx` untracked so the effect reacts only to `honors` changes
      // (depending on `fx` here would re-trigger itself — an infinite loop).
      untracked(() => {
        if (!seen) {
          seen = true;
          honors.forEach((h) => this.prev.set(h.id, h.value));
          return;
        }
        const reduced = this.reducedMotion();
        const next: Partial<Record<HonorId, RowFx>> = { ...this.fx() };
        let changed = false;
        for (const h of honors) {
          const before = this.prev.get(h.id);
          this.prev.set(h.id, h.value);
          if (before === undefined || before === h.value || reduced) {
            continue;
          }
          const up = h.value > before;
          next[h.id] = { delta: up ? '▲' : '▼', dir: up ? 'up' : 'down' };
          changed = true;
          const timer = setTimeout(() => this.clearFx(h.id), TileValuesBoardComponent.FX_MS);
          this.timers.add(timer);
        }
        if (changed) {
          this.fx.set(next);
        }
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.timers.forEach(clearTimeout);
      this.timers.clear();
    });
  }

  /** Filled track width as a percentage (value clamped to 0–10). */
  protected fillWidth(value: number): string {
    return `${(Math.max(0, Math.min(10, value)) / 10) * 100}%`;
  }

  private clearFx(id: HonorId): void {
    this.fx.update((current) => {
      const copy = { ...current };
      delete copy[id];
      return copy;
    });
  }

  private reducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
