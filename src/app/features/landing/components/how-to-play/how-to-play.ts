import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { GAME_CONFIG, Tile } from '@core';
import { MahjongTileComponent, NeonButtonComponent } from '@shared';

/**
 * The "How to Play" rules modal, opened from the landing Rules / How to Play
 * CTAs. Presentational: driven by `open`, emits `closed` / `startPlaying`.
 * Uses a native <dialog> for built-in focus trapping and Escape handling, and
 * reads every rule number from {@link GAME_CONFIG} so copy can't drift.
 */
@Component({
  selector: 'app-how-to-play',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MahjongTileComponent, NeonButtonComponent],
  templateUrl: './how-to-play.html',
  styleUrl: './how-to-play.css',
  host: { class: 'howto-host' },
})
export class HowToPlayComponent {
  readonly open = input(false);
  readonly closed = output<void>();
  readonly startPlaying = output<void>();

  protected readonly config = inject(GAME_CONFIG);

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Example number tiles (dots / bamboo / characters) for the values panel. */
  protected readonly numberTiles: Tile[] = [
    { kind: 'num', value: 1, suit: 'dots' },
    { kind: 'num', value: 6, suit: 'bamboo' },
    { kind: 'num', value: 5, suit: 'chars' },
  ];

  /** Example honor tiles (a dragon + a wind), shown with their starting badge. */
  protected readonly honorTiles: Tile[] = [
    { kind: 'honor', id: 'red' },
    { kind: 'honor', id: 'E' },
  ];

  constructor() {
    effect(() => {
      const dialog = this.dialogRef().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected onClose(): void {
    this.closed.emit();
  }

  protected onStart(): void {
    this.startPlaying.emit();
  }
}
