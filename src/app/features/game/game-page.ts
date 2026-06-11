import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GAME_SERVICE } from './services/game.service';
import { MockGameService } from './services/game.mock';

/**
 * Placeholder game screen — the real gameplay UI is built next.
 * Keeps the `/game` route resolvable from the landing CTA, and roots the
 * swappable {@link GAME_SERVICE} seam for the game feature (mock by default).
 */
@Component({
  selector: 'app-game-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  providers: [{ provide: GAME_SERVICE, useClass: MockGameService }],
  template: `
    <main class="wrap">
      <p class="eyebrow">Coming up next</p>
      <h1>Game screen</h1>
      <a routerLink="/">‹ Back to menu</a>
    </main>
  `,
  styles: `
    .wrap {
      min-height: 100vh;
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 12px;
      text-align: center;
    }
    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--color-muted);
    }
    a {
      color: var(--color-accent);
      text-decoration: none;
    }
  `,
})
export class GamePageComponent {}
