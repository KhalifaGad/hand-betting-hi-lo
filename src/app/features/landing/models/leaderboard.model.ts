/** A single personal best-run row on the landing-page board. */
export interface LeaderboardEntry {
  rank: number;
  /** When the run happened, e.g. "Today", "Yesterday", "Jun 5". */
  label: string;
  /** Short descriptor of the run, e.g. "28-hand streak". */
  detail: string;
  score: number;
}
