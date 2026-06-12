import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GAME_CONFIG, Tile } from '@core';
import { NeonButtonComponent } from '@shared';
import { HowToPlayComponent } from './components/how-to-play/how-to-play';
import { LeaderboardComponent } from './components/leaderboard/leaderboard';
import { TileFanComponent } from './components/tile-fan/tile-fan';
import { LeaderboardService } from './services/leaderboard.service';

/** Entry screen: hero wordmark, CTAs, leaderboard, and the decorative hand. */
@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NeonButtonComponent, HowToPlayComponent, LeaderboardComponent, TileFanComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  host: {
    '[class.dealing]': 'dealing()',
    '(document:keydown.enter)': 'onEnterKey($event)',
  },
})
export class LandingPageComponent {
  private readonly router = inject(Router);
  private readonly leaderboardService = inject(LeaderboardService);

  protected readonly config = inject(GAME_CONFIG);

  /** Whether the How to Play modal is open. */
  protected readonly howToOpen = signal(false);

  /** True while the "deal in" screen-flash plays before navigating. */
  protected readonly dealing = signal(false);

  /** How long the flash runs before the route swaps (matches the prototype). */
  private static readonly DEAL_MS = 360;
  private dealTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.dealTimer !== null) {
        clearTimeout(this.dealTimer);
      }
    });
  }

  /** Personal best runs, sourced from the (swappable) data service. */
  protected readonly leaderboard = this.leaderboardService.entries;
  protected readonly gamesPlayed = this.leaderboardService.gamesPlayed;

  /** Decorative opening hand for the hero fan. */
  protected readonly fanHand: Tile[] = [
    { kind: 'honor', honorId: 'eastWind' },
    { kind: 'num', value: 6, suit: 'dots' },
    { kind: 'honor', honorId: 'redDragon' },
    { kind: 'honor', honorId: 'greenDragon' },
    { kind: 'num', value: 5, suit: 'chars' },
  ];

  protected newGame(): void {
    if (this.dealing()) {
      return;
    }
    if (this.reducedMotion()) {
      void this.router.navigate(['/game']);
      return;
    }
    // play the "deal in" screen-flash, then swap to the game screen
    this.dealing.set(true);
    this.dealTimer = setTimeout(
      () => void this.router.navigate(['/game']),
      LandingPageComponent.DEAL_MS,
    );
  }

  private reducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  /** Enter deals in — unless the modal is open or a control already has focus. */
  protected onEnterKey(event: Event): void {
    if (this.howToOpen()) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('button, a, input, textarea, select, dialog')) {
      return; // let the focused control handle Enter natively
    }
    this.newGame();
  }

  protected howToPlay(): void {
    this.howToOpen.set(true);
  }

  protected startPlaying(): void {
    this.howToOpen.set(false);
    this.newGame();
  }

  protected clearScores(): void {
    this.leaderboardService.clear();
  }
}
