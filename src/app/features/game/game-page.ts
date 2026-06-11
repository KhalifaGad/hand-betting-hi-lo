import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { GAME_CONFIG } from '@core';
import { BetControlsComponent } from './components/bet-controls/bet-controls';
import { DeckPanelComponent } from './components/deck-panel/deck-panel';
import { GameDrawerComponent } from './components/game-drawer/game-drawer';
import { GameOverOverlayComponent } from './components/game-over-overlay/game-over-overlay';
import { GameTopBarComponent } from './components/game-top-bar/game-top-bar';
import { HandComponent } from './components/hand/hand';
import { HistoryStripComponent } from './components/history-strip/history-strip';
import { ReshuffleToastComponent } from './components/reshuffle-toast/reshuffle-toast';
import { BetResult } from './components/result-banner/result-banner';
import { ResultBannerComponent } from './components/result-banner/result-banner';
import { TileValuesBoardComponent } from './components/tile-values-board/tile-values-board';
import { GameOver } from './models/game-view.model';
import { BetDirection, GAME_SERVICE } from './services/game.service';
import { MockGameService } from './services/game.mock';

/**
 * Smart-but-thin game container. Reads the {@link GameView} signal from the
 * (swappable) {@link GAME_SERVICE} and feeds its fields to the dumb children;
 * child events delegate straight back to `bet` / `newGame` / `reset`. It holds
 * NO game rules — only presentation wiring (banner/flash derived from history)
 * and the scoped keyboard shortcuts (← lower · → higher · G summary preview).
 */
@Component({
  selector: 'app-game-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GameTopBarComponent,
    DeckPanelComponent,
    HandComponent,
    BetControlsComponent,
    ResultBannerComponent,
    TileValuesBoardComponent,
    HistoryStripComponent,
    ReshuffleToastComponent,
    GameOverOverlayComponent,
    GameDrawerComponent,
  ],
  providers: [{ provide: GAME_SERVICE, useClass: MockGameService }],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
  host: {
    class: 'game-page',
    tabindex: '-1',
    '(keydown.arrowleft)': 'onKey($event, "lower")',
    '(keydown.arrowright)': 'onKey($event, "higher")',
    '(keydown.g)': 'onToggleSummary($event)',
  },
})
export class GamePageComponent {
  private readonly game = inject(GAME_SERVICE);
  private readonly router = inject(Router);
  private readonly config = inject(GAME_CONFIG);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The current view-model the UI renders. */
  protected readonly view = this.game.view;

  /** A dev-only game-over preview toggled with `G` (no real rules involved). */
  private readonly preview = signal<GameOver | null>(null);

  private readonly toast = viewChild.required(ReshuffleToastComponent);

  /** Real game over wins; otherwise the keyboard preview, if any. */
  protected readonly overlayData = computed(() => this.view().gameOver ?? this.preview());

  /** Bet buttons are off while a hand resolves or the summary is up. */
  protected readonly betsDisabled = computed(
    () => this.view().resolving || this.overlayData() !== null,
  );

  /** The most recent resolved bet (newest history entry), for the banner. */
  protected readonly lastResult = computed<BetResult | null>(() => {
    const latest = this.view().history[0];
    return latest ? { dir: latest.dir, result: latest.result } : null;
  });

  /** Win/lose flash for the freshly-dealt hand (push → no flash). */
  protected readonly handFlash = computed<'win' | 'lose' | null>(() => {
    const result = this.view().history[0]?.result;
    return result === 'win' || result === 'lose' ? result : null;
  });

  constructor() {
    // Focus the screen so the arrow/G shortcuts work without a prior click.
    afterNextRender(() => this.host.nativeElement.focus({ preventScroll: true }));
  }

  protected onBet(direction: BetDirection): void {
    this.game.bet(direction);
  }

  protected onExit(): void {
    void this.router.navigate(['/']);
  }

  protected onPlayAgain(): void {
    this.preview.set(null);
    this.game.newGame();
  }

  protected onReshuffled(): void {
    this.toast().pulse();
  }

  /** ← / → place a bet, unless a control is focused-with-intent or play is paused. */
  protected onKey(event: Event, direction: BetDirection): void {
    if (this.shouldIgnore(event) || this.betsDisabled()) {
      return;
    }
    event.preventDefault();
    this.game.bet(direction);
  }

  /** `G` toggles the game-over summary preview (skipped during a real game over). */
  protected onToggleSummary(event: Event): void {
    if (this.shouldIgnore(event) || this.view().gameOver !== null) {
      return;
    }
    event.preventDefault();
    this.preview.update((current) => (current ? null : this.previewSummary()));
  }

  /** Ignore shortcuts with modifiers or while a text control is focused. */
  private shouldIgnore(event: Event): boolean {
    const ke = event as KeyboardEvent;
    if (ke.ctrlKey || ke.metaKey || ke.altKey) {
      return true;
    }
    const target = event.target as HTMLElement | null;
    return target?.closest('input, textarea, select') != null;
  }

  /** A believable end-of-game card built from the live view (preview only). */
  private previewSummary(): GameOver {
    const v = this.view();
    return {
      reason: `Preview — a wind reached ${this.config.bustHigh}`,
      finalScore: v.score,
      hands: v.round,
      bestStreak: v.streak,
      isHighScore: false,
    };
  }
}
