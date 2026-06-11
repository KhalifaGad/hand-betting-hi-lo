/** The three numbered Mahjong suits. */
export type Suit = 'dots' | 'bamboo' | 'chars';

/** Numbered tile faces run 1–9. */
export type TileNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** The seven honor tiles: three dragons + four winds. */
export type HonorId = 'red' | 'green' | 'white' | 'E' | 'S' | 'W' | 'N';

/**
 * A single Mahjong tile. Numbered tiles carry a face value; honor tiles
 * carry a dynamic value the game logic tracks (rendered as a badge).
 */
export type Tile = { kind: 'num'; value: TileNumber; suit: Suit } | { kind: 'honor'; id: HonorId };
