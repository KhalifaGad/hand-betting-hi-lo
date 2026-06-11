import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BetDirection } from '../../services/game.service';

/**
 * The two big bet buttons (▼ Bet Lower / ▲ Bet Higher) plus the prompt.
 * Disabled while a hand resolves or the game is over; emits `bet` with the
 * chosen direction. Local styling for the gradient bet variants.
 */
@Component({
  selector: 'app-bet-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bet-controls.html',
  styleUrl: './bet-controls.css',
})
export class BetControlsComponent {
  readonly disabled = input(false);
  readonly bet = output<BetDirection>();
}
