import { GameRun } from "@core/models/game-run.model";

export interface GameResultRepository {
  save(run: GameRun): void;
  topRuns(n: number): GameRun[];
  isHighScore(score: number): boolean;
  clear(): void;
  count(): number;
}
