import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MahjongTileComponent } from '@shared';
import { HistoryEntry } from '../../models/game-view.model';

/**
 * Bottom history strip — previous hands, newest-first, horizontally scrollable.
 * Each card shows the mini hand, its total, the bet direction, and the result
 * (WON / LOST / PUSH) with a colored border. Renders entries in the order given
 * (the container supplies them newest-first). Empty until the first hand lands.
 */
@Component({
  selector: 'app-history-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MahjongTileComponent],
  templateUrl: './history-strip.html',
  styleUrl: './history-strip.css',
  host: {
    class: 'history',
    '[class.embedded]': 'embedded()',
  },
})
export class HistoryStripComponent {
  readonly entries = input<HistoryEntry[]>([]);
  /** When embedded (mobile drawer) it drops its header and stacks cards vertically. */
  readonly embedded = input(false);

  protected readonly count = computed(() => {
    const n = this.entries().length;
    return `${n} ${n === 1 ? 'hand' : 'hands'}`;
  });

  protected arrow(dir: HistoryEntry['dir']): string {
    return dir === 'higher' ? '▲' : '▼';
  }

  protected resultLabel(result: HistoryEntry['result']): string {
    switch (result) {
      case 'win':
        return 'WON';
      case 'lose':
        return 'LOST';
      default:
        return 'PUSH';
    }
  }
}
