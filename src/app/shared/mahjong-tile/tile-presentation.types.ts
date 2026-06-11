/** Honor tile type — dragons render framed, winds carry a direction letter. */
export type HonorType = 'dragon' | 'wind';

/** Ink color class applied to an honor glyph. */
export type InkClass = 'g-red' | 'g-green' | 'g-blue' | 'g-ink';

/** Static presentation metadata for a single honor tile. */
export interface HonorMeta {
  glyph: string;
  name: string;
  ink: InkClass;
  type: HonorType;
  /** Latin direction letter, winds only. */
  letter?: string;
}
