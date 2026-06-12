import { Tile } from "@core";

export type HonorGameTile = Extract<Tile, { kind: 'honor' }> & { id: string; value: number };
export type NumberGameTile = Extract<Tile, { kind: 'num' }> & { id: string };

export type GameTile =
  | NumberGameTile
  | HonorGameTile;
