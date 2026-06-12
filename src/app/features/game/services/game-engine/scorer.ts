import { GameConfig } from "@core";
import { RoundResult } from "../../models";

export class Scorer {
  constructor(private readonly config: GameConfig) {}

    apply(currentScore: number, result: RoundResult, streak: number): { score: number, streak: number } {
        if (result === 'push') { 
            return {
                score: currentScore,
                streak: streak,
            };
        }

        if (result === 'win') {
            return {
                score: currentScore + Math.max(streak, 1) * this.config.scorePerStreak,
                streak: streak + 1,
            };
        }

        return {
            score: currentScore,
            streak: 0,
        };
  }
}