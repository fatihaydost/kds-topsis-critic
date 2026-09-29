export type CriterionType = 'benefit' | 'cost'

export type Criterion = { name: string; type: CriterionType }

/** matrix[i][j] = value of alternative i on criterion j. */
export type Problem = {
  alternatives: string[]
  criteria: Criterion[]
  matrix: number[][]
}

/**
 * One intermediate result for the step-by-step view.
 * `key` is a stable id (later an i18n key), e.g. 'topsis.normalized'.
 */
export type Step = {
  key: string
  matrix?: number[][]
  vector?: number[]
  scalar?: number
}

/** A non-fatal note produced while computing (the result is still usable). */
export type MethodWarning = {
  code: string
  /** Criterion index, when the warning is about one column. */
  col?: number
  /** Alternative index, when the warning is about one row. */
  row?: number
}

export type WeightingResult = {
  weights: number[]
  steps: Step[]
  diagnostics?: Record<string, number>
  warnings?: MethodWarning[]
}

export interface WeightingMethod<P = {}> {
  id: string
  kind: 'weighting'
  compute(problem: Problem, params: P): WeightingResult
}

export type RankingResult = {
  scores: number[]
  /** Whether a higher ('desc') or lower ('asc') score is better. */
  order: 'desc' | 'asc'
  /** ranking[i] = 1-based rank of alternative i; ties share the rank (competition ranking: 1, 1, 3). */
  ranking: number[]
  steps: Step[]
  diagnostics?: Record<string, number>
  warnings?: MethodWarning[]
}

export interface RankingMethod<P = {}> {
  id: string
  kind: 'ranking'
  requires?: { positiveValues?: boolean }
  compute(problem: Problem, weights: number[], params: P): RankingResult
}

export type Method = WeightingMethod | RankingMethod
