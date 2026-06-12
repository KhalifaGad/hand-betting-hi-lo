import { TestBed } from '@angular/core/testing';
import { GAME_RESULT_REPOSITORY, GameResultRepository, GameRun } from '@core';
import { LeaderboardService } from './leaderboard.service';

/** A simple, controllable repo so the presenter is tested in isolation. */
class FakeRepo implements GameResultRepository {
  runs: GameRun[] = [];
  cleared = false;
  save(): void {}
  topRuns(n: number): GameRun[] {
    return this.runs.slice(0, n);
  }
  isHighScore(): boolean {
    return true;
  }
  count(): number {
    return this.runs.length;
  }
  clear(): void {
    this.cleared = true;
    this.runs = [];
  }
}

function makeRun(overrides: Partial<GameRun> = {}): GameRun {
  return {
    score: 1000,
    streak: 0,
    bestStreak: 0,
    reshuffles: 0,
    hands: 10,
    date: new Date(),
    ...overrides,
  };
}

describe('LeaderboardService', () => {
  let repo: FakeRepo;

  // The service snapshots the repo at construction, so seed runs BEFORE inject.
  function create(runs: GameRun[] = []): LeaderboardService {
    repo = new FakeRepo();
    repo.runs = runs;
    TestBed.configureTestingModule({
      providers: [LeaderboardService, { provide: GAME_RESULT_REPOSITORY, useValue: repo }],
    });
    return TestBed.inject(LeaderboardService);
  }

  it('maps the repository runs into ranked leaderboard entries', () => {
    const service = create([makeRun({ score: 1500 }), makeRun({ score: 900 })]);
    const entries = service.entries();
    expect(entries.length).toBe(2);
    expect(entries[0]).toMatchObject({ rank: 1, score: 1500 });
    expect(entries[1]).toMatchObject({ rank: 2, score: 900 });
    expect(entries[0].label).toBeTruthy();
    expect(entries[0].detail).toBeTruthy();
  });

  it('reads the games-played count from the repository', () => {
    const service = create([makeRun(), makeRun(), makeRun()]);
    expect(service.gamesPlayed()).toBe(3);
  });

  it('labels a run played today as "Today"', () => {
    const service = create([makeRun({ date: new Date() })]);
    expect(service.entries()[0].label).toBe('Today');
  });

  it('builds a streak-flavoured detail for a hot run', () => {
    // bestStreak ≥ 4 → streak phrasing; hands % 3 === 0 → first variant.
    const service = create([makeRun({ bestStreak: 5, hands: 0 })]);
    expect(service.entries()[0].detail).toBe('5-win streak');
  });

  it('clear() wipes the store and empties the board', () => {
    const service = create([makeRun(), makeRun()]);
    service.clear();
    expect(repo.cleared).toBe(true);
    expect(service.entries()).toEqual([]);
    expect(service.gamesPlayed()).toBe(0);
  });

  it('exposes entries as a read-only signal', () => {
    const service = create();
    expect('set' in service.entries).toBe(false);
    expect('update' in service.entries).toBe(false);
  });
});
