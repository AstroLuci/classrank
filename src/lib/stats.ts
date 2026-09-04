import type { RankStats } from "./types";

/** Sample standard deviation (n − 1). Returns null when fewer than 2 values. */
export function computeRankStats(ranks: number[]): RankStats {
  const count = ranks.length;
  if (count === 0) {
    return { count: 0, mean: null, sd: null, min: null, max: null, median: null };
  }

  const sorted = [...ranks].sort((a, b) => a - b);
  const mean = ranks.reduce((sum, r) => sum + r, 0) / count;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  let median: number;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    median = sorted[mid];
  }

  let sd: number | null = null;
  if (count >= 2) {
    const variance =
      ranks.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (count - 1);
    sd = Math.sqrt(variance);
  }

  return { count, mean, sd, min, max, median };
}

export function formatStat(value: number | null, digits = 2): string {
  if (value === null || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}
