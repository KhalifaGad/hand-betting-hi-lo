import { GameTile, HonorGameTile, RoundResult } from "@features/game/models";
import { GameConfig } from "@core";

export interface DriftOutcome { hand: GameTile[]; busted: HonorGameTile | null; }

export class Scaler { 
    constructor(private readonly config: GameConfig) { }
    
    apply(hand: GameTile[], roundResult: RoundResult): DriftOutcome {
        if (roundResult === 'push') {
            return { hand, busted: null };
        }

        const step = roundResult === 'win' ? 1 : -1;
        let busted: HonorGameTile | null = null;

        const updatedHand = hand.map((tile) => {
            if (tile.kind !== 'honor') return tile;
            const drifted = { ...tile, value: tile.value + step };
            if (drifted.value <= this.config.bustLow || drifted.value >= this.config.bustHigh) {
                busted ??= drifted;
            }
            return drifted;
        });
        return { hand: updatedHand, busted };
    }
}