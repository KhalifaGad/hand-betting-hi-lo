import { GameConfig, HonorId, TileNumber } from "@core";
import { GameTile } from "../../models";
import { HONOR_META } from "@shared";

export class Deck { 
    constructor(
        private readonly config: GameConfig,
        private readonly newId: () => string,
        private readonly range: () => number = Math.random,
    ) { }

    createPile(): GameTile[] { 
        const numbers: GameTile[] = Array
            .from({ length: 9 })
            .flatMap((_, index) => Array
                .from({ length: this.config.tileRepetition })
                .flatMap(() => [
                    { id: this.newId(), kind: 'num', value: index + 1 as TileNumber, suit: 'dots' }, 
                    { id: this.newId(), kind: 'num', value: index + 1 as TileNumber, suit: 'bamboo' }, 
                    { id: this.newId(), kind: 'num', value: index + 1 as TileNumber, suit: 'chars' }, 
                ]));
        const honors: GameTile[] = Object.keys(HONOR_META)
            .flatMap((honorId) => Array
                .from({ length: this.config.tileRepetition })
                .flatMap(() => [
                    { id: this.newId(), kind: 'honor', honorId: honorId as HonorId, value: this.config.honorStart },
                ]));
        
        return [...numbers, ...honors];
    }

    shuffle(pile: GameTile[]): GameTile[] {
        const shuffledPile = [...pile];
        for (let i = pile.length - 1; i > 0; i--) {
            const j = Math.floor(this.range() * (i + 1));
            [shuffledPile[i], shuffledPile[j]] = [shuffledPile[j], shuffledPile[i]];
        }
        return shuffledPile;
    }

    draw(pile: GameTile[], n: number): { hand: GameTile[]; remaining: GameTile[] } {
        return { hand: pile.slice(0, n), remaining: pile.slice(n) };
    }
}