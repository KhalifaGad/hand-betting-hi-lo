import { HonorId, Suit, TileNumber, Tile } from "@core";

export type HonorGameTile = Extract<Tile, { kind: 'honor' }> & { id: string; value: number };

export type GameTile =
  | { id: string; kind: 'num'; value: TileNumber; suit: Suit }
  | HonorGameTile;
