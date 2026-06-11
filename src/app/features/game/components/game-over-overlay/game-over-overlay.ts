import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { GameOver } from '../../models/game-view.model';

/**
 * End-of-game summary card over a blurred backdrop. Driven by `data`: non-null
 * opens it, null closes it. Uses a native `<dialog>` (`showModal`) for built-in
 * focus trapping + Escape handling — matching the landing's How-to-Play modal.
 * Emits `playAgain` / `exit`; the resting open state is the visible one.
 */
@Component({
  selector: 'app-game-over-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-over-overlay.html',
  styleUrl: './game-over-overlay.css',
  host: { class: 'overlay-host' },
})
export class GameOverOverlayComponent {
  readonly data = input<GameOver | null>(null);
  readonly playAgain = output<void>();
  readonly exit = output<void>();

  protected readonly scoreLabel = computed(() =>
    (this.data()?.finalScore ?? 0).toLocaleString('en-US'),
  );

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialogRef().nativeElement;
      const open = this.data() !== null;
      if (open && !dialog.open) {
        dialog.showModal();
      } else if (!open && dialog.open) {
        dialog.close();
      }
    });
  }
}
