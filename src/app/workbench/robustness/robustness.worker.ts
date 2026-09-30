/**
 * Monte Carlo weights (core monteCarlo) off the main thread: 10,000 rankings would block the slider and the page for
 * a noticeable moment. One request at a time; the page drops stale answers by id and terminates a worker that is still
 * busy when a new request comes (the calculation is synchronous, so a message could not interrupt it).
 */
import { getRankingMethod } from '../../../core/registry'
import { monteCarlo, type Concentration, type MonteCarloResult } from '../../../core/robustness'
import type { Problem } from '../../../core/types'

export type MonteCarloRequest = {
  id: number
  problem: Problem
  weights: number[]
  method: string
  concentration: Concentration
  n: number
  seed: number
}

export type MonteCarloResponse = { id: number; result: MonteCarloResult } | { id: number; error: string }

/** Runs one request; shared with the main-thread fallback where workers are not available. */
export function runMonteCarlo(req: MonteCarloRequest): MonteCarloResponse {
  const method = getRankingMethod(req.method)
  if (!method) return { id: req.id, error: `unknown ranking method ${req.method}` }
  try {
    const result = monteCarlo(req.problem, req.weights, method, { concentration: req.concentration, n: req.n, seed: req.seed })
    return { id: req.id, result }
  } catch (err) {
    return { id: req.id, error: err instanceof Error ? err.message : String(err) }
  }
}

type WorkerScope = { onmessage: ((e: MessageEvent<MonteCarloRequest>) => void) | null; postMessage: (msg: MonteCarloResponse) => void }

// Only inside a worker (no `document`): the fallback imports runMonteCarlo on the main thread too.
if (typeof document === 'undefined' && typeof self !== 'undefined') {
  const scope = self as unknown as WorkerScope
  scope.onmessage = (e) => scope.postMessage(runMonteCarlo(e.data))
}
