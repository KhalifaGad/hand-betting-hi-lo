import { GameRun } from "@core/models/game-run.model";
import { GameResultRepository } from "./game-result.repository";
import { InjectionToken } from "@angular/core";

class GameResultLocalStorage implements GameResultRepository {

    private readonly key = 'game-result';

    save(run: GameRun): void {
        const existingRuns = this.getExistingRuns();
        const allRuns = [...existingRuns, run];
        const sortedRuns = allRuns.sort((a, b) => b.score - a.score);
        localStorage.setItem(this.key, JSON.stringify(sortedRuns));
    }

    topRuns(n: number): GameRun[] {
        return this.getExistingRuns().slice(0, n);
    }

    isHighScore(score: number): boolean {
        return score > (this.topRuns(5).at(4)?.score ?? 0);
    }

    clear(): void {
        localStorage.removeItem(this.key);
    }

    count(): number {
        return this.getExistingRuns().length;
    }

    private getExistingRuns(): GameRun[] {
        return JSON.parse(localStorage.getItem(this.key) || '[]');
    }
}

export const GAME_RESULT_REPOSITORY = new InjectionToken<GameResultRepository>('GAME_RESULT_REPOSITORY', {
    providedIn: 'root',
    factory: () => new GameResultLocalStorage(),
});
