/**
 * Robustness of a ranking to its weights: one-at-a-time weight sweep with stability intervals, Monte Carlo
 * weights (Dirichlet) with rank acceptability, criterion removal, and rank agreement coefficients.
 * Formulas and sources: docs/research/combinations.md §C. Pure functions, no DOM; deterministic given a seed.
 *
 * The ranking method is passed in, so any RankingMethod (today TOPSIS) works unchanged.
 */
import type { Problem, RankingMethod, WeightingMethod } from './types'

// ---------- C.1 One-at-a-time weight perturbation ----------

/**
 * Set criterion k's weight to `wk` (clamped to [0, 1]) and rescale the others proportionally so the sum stays 1:
 * w_j' = w_j (1 - wk') / (1 - w_k). When w_k = 1 the others cannot be rescaled: they share 1 - wk' equally.
 */
export function reweight(weights: readonly number[], k: number, wk: number): number[] {
  throw new Error('not implemented')
}

/** One point of a sweep: the weight of criterion k, the full weight vector, scores and ranks at that point. */
export type SweepPoint = { wk: number; weights: number[]; scores: number[]; ranking: number[] }

/**
 * An interval of w_k over which the full ranking (or only the first place) stays the same.
 * `from`/`to` are exact switch points (found by bisection between grid points to 1e-6), not grid values.
 */
export type StableInterval = { from: number; to: number; ranking: number[]; top: number[] }

export type Sweep = {
  k: number
  /** Grid of `steps + 1` points over w_k ∈ [0, 1] (default steps 100). */
  points: SweepPoint[]
  /** Consecutive intervals covering [0, 1] where the full ranking is constant. */
  rankingIntervals: StableInterval[]
  /** Consecutive intervals covering [0, 1] where the set of first-ranked alternatives is constant. */
  topIntervals: StableInterval[]
  /** The interval that contains the base weight w_k (the weight stability interval, Mareschal 1988). */
  baseRankingInterval: StableInterval
  baseTopInterval: StableInterval
}

export function sweepWeight(
  problem: Problem,
  weights: readonly number[],
  method: RankingMethod,
  k: number,
  opts?: { steps?: number },
): Sweep {
  throw new Error('not implemented')
}

/** Relative step δ applied to criterion k (w_k(1 + δ), clamped), with agreement to the base ranking. */
export type PerturbationRow = {
  k: number
  delta: number
  weights: number[]
  ranking: number[]
  sameTop: boolean
  spearman: number
  ws: number
}

/** Default grid δ ∈ {−20 %, −10 %, −5 %, +5 %, +10 %, +20 %} for every criterion. */
export const DEFAULT_DELTAS: readonly number[] = [-0.2, -0.1, -0.05, 0.05, 0.1, 0.2]

export function perturbWeights(
  problem: Problem,
  weights: readonly number[],
  method: RankingMethod,
  deltas?: readonly number[],
): PerturbationRow[] {
  throw new Error('not implemented')
}

// ---------- C.2 Monte Carlo (Dirichlet) ----------

/** 'uniform' = Dirichlet(1, …, 1) (SMAA). A number κ = Dirichlet(κ·w̄) around the base weights. */
export type Concentration = 'uniform' | number

export type MonteCarloResult = {
  n: number
  /** acceptability[i][r] = share of runs where alternative i has rank r + 1 (competition ranks; ties share). */
  acceptability: number[][]
  /** Mean rank of each alternative. */
  meanRank: number[]
  /** 2.5 % and 97.5 % rank quantiles of each alternative. */
  rankInterval: [number, number][]
  /** Share of runs whose first-ranked set equals the base one. */
  sameTop: number
  meanSpearman: number
  meanWs: number
}

/** Seeded PRNG (mulberry32): same seed, same sequence, on every platform. */
export function createRng(seed: number): () => number {
  throw new Error('not implemented')
}

/** One draw from Dirichlet(alpha) via Gamma(alpha_j, 1) (Marsaglia and Tsang 2000; boost for alpha < 1). */
export function sampleDirichlet(alpha: readonly number[], rng: () => number): number[] {
  throw new Error('not implemented')
}

export function monteCarlo(
  problem: Problem,
  weights: readonly number[],
  method: RankingMethod,
  opts: { concentration: Concentration; n?: number; seed?: number },
): MonteCarloResult {
  throw new Error('not implemented')
}

// ---------- C.3 Criterion removal ----------

export type RemovalRow = {
  /** Removed criterion. */
  j: number
  /** 'renormalize' = w_k / (1 − w_j); 'recompute' = the weighting method run again on the reduced matrix. */
  mode: 'renormalize' | 'recompute'
  weights: number[]
  ranking: number[]
  sameTop: boolean
  spearman: number
  ws: number
}

/** `weighting` is needed for 'recompute'; without it only 'renormalize' rows are returned. Skipped when n ≤ 2. */
export function removeCriteria(
  problem: Problem,
  weights: readonly number[],
  method: RankingMethod,
  weighting?: WeightingMethod,
): RemovalRow[] {
  throw new Error('not implemented')
}

// ---------- C.6 Agreement between rankings (x = reference ranks, y = test ranks, 1-based) ----------

/** Spearman's ρ; with ties, the Pearson correlation of mid-ranks. */
export function spearman(x: readonly number[], y: readonly number[]): number {
  throw new Error('not implemented')
}

/** Kendall's τ_b. */
export function kendallTauB(x: readonly number[], y: readonly number[]): number {
  throw new Error('not implemented')
}

/** WS coefficient (Sałabun and Urbaniak 2020): asymmetric, x is the reference, top positions dominate. */
export function wsCoefficient(x: readonly number[], y: readonly number[]): number {
  throw new Error('not implemented')
}
