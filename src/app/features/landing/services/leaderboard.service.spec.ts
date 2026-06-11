import { TestBed } from '@angular/core/testing';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaderboardService);
  });

  it('starts with no runs and a zero games count', () => {
    expect(service.entries()).toEqual([]);
    expect(service.gamesPlayed()).toBe(0);
  });

  it('exposes readonly signals (no set/update)', () => {
    expect('set' in service.entries).toBe(false);
    expect('update' in service.entries).toBe(false);
    expect('set' in service.gamesPlayed).toBe(false);
  });
});
