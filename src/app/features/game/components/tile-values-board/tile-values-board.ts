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
import { GAME_CONFIG, HonorId, Tile } from '@core';
import { MahjongTileComponent } from '@shared';
import { HonorDistribution } from '../../models/game-view.model';
import { CountPopDirective } from '../count-pop.directive';

/** A single copy's dot on the swarm track. */
interface Marker {
  /** Stable per-copy key (`honorId-copyIndex`) — drives tracking + change pulse. */
  key: string;
  value: number;
  /** Horizontal position as a percentage of the 0–10 scale. */
  left: number;
  /** Vertical jitter (px) so copies sharing a value fan out instead of stacking. */
  offset: number;
  /** In the edge band (≤ dangerLow / ≥ dangerHigh) → red marker, counts as at-risk. */
  edge: boolean;
}

/** A board row: one honor type, the tile to render, and its swarm of copies. */
interface ValueRow {
  honor: HonorDistribution;
  tile: Tile;
  markers: Marker[];
  /** Live number of copies of this type (the `×N` readout). */
  count: number;
  /** How many copies sit in the edge band (the `⚠ k` readout). */
  riskCount: number;
  /** Row danger state: at least one copy in the edge band. */
  danger: boolean;
}

/**
 * Right-rail / mobile-sheet "Tile Values" board. Each of the 7 honor types gets
 * a row carrying a 0–10 swarm track with ONE dot per live copy: dots position
 * by value, fan out vertically when they share a value, and turn red in the
 * edge band (≤ dangerLow / ≥ dangerHigh). The population grows on reshuffle, so
 * the row renders `values.length` markers and an `×N` count rather than a fixed
 * set. When a copy changes its dot pulses + slides (CSS) and a ▲/▼ delta floats
 * by the name. Resting state carries no FX classes — SSR / reduced-motion safe.
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
    // Drive the track's red danger bands off the real thresholds, in % of the 0–10 scale.
    '[style.--edge-low.%]': 'edgeLowPct',
    '[style.--edge-high.%]': 'edgeHighPct',
  },
})
export class TileValuesBoardComponent {
  readonly honors = input<HonorDistribution[]>([]);
  /** When embedded (e.g. in the mobile drawer) it drops its own panel chrome + header. */
  readonly embedded = input(false);

  private readonly config = inject(GAME_CONFIG);

  /** Left/right danger-band extents as % of the track, derived from the config thresholds. */
  protected readonly edgeLowPct = (this.config.dangerLow / 10) * 100;
  protected readonly edgeHighPct = (this.config.dangerHigh / 10) * 100;

  protected readonly rows = computed<ValueRow[]>(() =>
    this.honors().map((honor) => {
      const markers = this.markersFor(honor);
      const riskCount = markers.filter((m) => m.edge).length;
      return {
        honor,
        tile: { kind: 'honor', honorId: honor.honorId },
        markers,
        count: honor.values.length,
        riskCount,
        danger: riskCount > 0,
      };
    }),
  );

  /** Keys of copies that just changed — drives the per-marker pulse. */
  protected readonly changedKeys = signal<ReadonlySet<string>>(new Set());
  /** Active ▲/▼ delta per honor type (cleared after the float animation). */
  protected readonly delta = signal<Partial<Record<HonorId, '▲' | '▼'>>>({});

  private readonly prev = new Map<HonorId, number[]>();
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private static readonly FX_MS = 1000;

  /** Preferred vertical gap (px) between same-value copies in the swarm. */
  private static readonly JITTER_GAP = 5;
  /** Half the max vertical spread (px); the fan never grows past ±this, so dense
   *  clusters tighten (dots overlap) instead of overflowing the track. */
  private static readonly JITTER_MAX = 8;

  constructor() {
    let seen = false;
    effect(() => {
      const honors = this.honors();
      // Read/write FX state untracked so the effect reacts only to `honors`
      // changes (depending on the FX signals here would re-trigger itself).
      untracked(() => {
        if (!seen) {
          seen = true;
          honors.forEach((h) => this.prev.set(h.honorId, [...h.values]));
          return;
        }
        if (this.reducedMotion()) {
          honors.forEach((h) => this.prev.set(h.honorId, [...h.values]));
          return;
        }
        const changed = new Set(this.changedKeys());
        const nextDelta = { ...this.delta() };
        let touched = false;
        for (const h of honors) {
          const before = this.prev.get(h.honorId) ?? [];
          this.prev.set(h.honorId, [...h.values]);
          // Compare existing copies index-by-index; appended copies (reshuffle)
          // are fresh entrants, not changes — the `×N` count pops for those.
          const shared = Math.min(before.length, h.values.length);
          for (let i = 0; i < shared; i++) {
            if (before[i] === h.values[i]) {
              continue;
            }
            const key = `${h.honorId}-${i}`;
            changed.add(key);
            nextDelta[h.honorId] = h.values[i] > before[i] ? '▲' : '▼';
            touched = true;
            const timer = setTimeout(() => this.clearFx(h.honorId, key), TileValuesBoardComponent.FX_MS);
            this.timers.add(timer);
          }
        }
        if (touched) {
          this.changedKeys.set(changed);
          this.delta.set(nextDelta);
        }
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.timers.forEach(clearTimeout);
      this.timers.clear();
    });
  }

  /** Build the dot swarm for one honor type's roster of copies. */
  private markersFor(honor: HonorDistribution): Marker[] {
    const { dangerLow, dangerHigh } = this.config;
    const { JITTER_GAP, JITTER_MAX } = TileValuesBoardComponent;
    // Totals per value let us center each value's cluster symmetrically.
    const totals = new Map<number, number>();
    for (const v of honor.values) {
      totals.set(v, (totals.get(v) ?? 0) + 1);
    }
    const running = new Map<number, number>();
    return honor.values.map((value, i) => {
      const total = totals.get(value) ?? 1;
      const rank = running.get(value) ?? 0;
      running.set(value, rank + 1);
      // Shrink the gap as a cluster grows so the fan stays within ±JITTER_MAX:
      // few copies fan out comfortably, many copies tighten into a packed stack.
      const step = total > 1 ? Math.min(JITTER_GAP, (2 * JITTER_MAX) / (total - 1)) : 0;
      const offset = (rank - (total - 1) / 2) * step;
      const clamped = Math.max(0, Math.min(10, value));
      return {
        key: `${honor.honorId}-${i}`,
        value,
        left: (clamped / 10) * 100,
        offset,
        edge: value <= dangerLow || value >= dangerHigh,
      };
    });
  }

  private clearFx(id: HonorId, key: string): void {
    this.changedKeys.update((current) => {
      const copy = new Set(current);
      copy.delete(key);
      return copy;
    });
    this.delta.update((current) => {
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
