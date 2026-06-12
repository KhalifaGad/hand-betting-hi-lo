import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { GAME_CONFIG } from '@core';
import { HistoryEntry } from '../../models/game-view.model';
import { HonorDistribution } from '../../models/game-view.model';
import { HistoryStripComponent } from '../history-strip/history-strip';
import { TileValuesBoardComponent } from '../tile-values-board/tile-values-board';

type DrawerTab = 'values' | 'history';

/**
 * Mobile-only bottom drawer that holds the Tile Values + History panels (which
 * live in the side/bottom rails on desktop). A collapsed bar shows an "N at
 * risk" cue; tapping it slides up a sheet with a Values / History tab switch.
 * Hidden entirely above the mobile breakpoint — the desktop rails take over.
 */
@Component({
  selector: 'app-game-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TileValuesBoardComponent, HistoryStripComponent],
  templateUrl: './game-drawer.html',
  styleUrl: './game-drawer.css',
  host: { '(keydown.escape)': 'open.set(false)' },
})
export class GameDrawerComponent {
  readonly honors = input<HonorDistribution[]>([]);
  readonly history = input<HistoryEntry[]>([]);

  private readonly config = inject(GAME_CONFIG);

  protected readonly open = signal(false);
  protected readonly tab = signal<DrawerTab>('values');

  /** Honor TYPES with at least one copy in the danger band — surfaced on the collapsed bar. */
  protected readonly atRisk = computed(() => {
    const { dangerLow, dangerHigh } = this.config;
    return this.honors().filter((h) => h.values.some((v) => v <= dangerLow || v >= dangerHigh))
      .length;
  });

  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    // Move focus into the sheet when it opens (focus management for the modal-ish drawer).
    effect(() => {
      if (this.open()) {
        this.closeButton()?.nativeElement.focus();
      }
    });
  }
}
