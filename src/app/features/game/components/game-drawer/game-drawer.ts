import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { HistoryEntry } from '../../models/game-view.model';
import { HonorValue } from '../../models/game-view.model';
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
  readonly honors = input<HonorValue[]>([]);
  readonly history = input<HistoryEntry[]>([]);

  protected readonly open = signal(false);
  protected readonly tab = signal<DrawerTab>('values');

  /** Honor tiles currently in the danger band — surfaced on the collapsed bar. */
  protected readonly atRisk = computed(() => this.honors().filter((h) => h.danger).length);

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
