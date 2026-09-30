import { useEffect, useRef, useState } from 'react'
import type { Concentration, MonteCarloResult } from '../../../core/robustness'
import type { Problem } from '../../../core/types'
import { runMonteCarlo, type MonteCarloRequest, type MonteCarloResponse } from './robustness.worker'

export type MonteCarloState = {
  /** The last finished result; it stays on screen while a new one is calculated. */
  result: MonteCarloResult | null
  /** A calculation for the current inputs is running. */
  busy: boolean
  failed: boolean
}

function createWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null
  try {
    return new Worker(new URL('./robustness.worker.ts', import.meta.url), { type: 'module' })
  } catch {
    return null
  }
}

/**
 * Monte Carlo weights in a Web Worker. A change of the inputs cancels the running calculation (the worker is
 * terminated and a new one started) and starts the new one; answers to older requests are dropped by id.
 */
export function useMonteCarlo(
  problem: Problem,
  weights: readonly number[],
  method: string,
  concentration: Concentration,
  n: number,
  seed: number,
): MonteCarloState {
  const [state, setState] = useState<MonteCarloState>({ result: null, busy: true, failed: false })
  const worker = useRef<Worker | null>(null)
  const running = useRef(false)
  const lastId = useRef(0)

  useEffect(() => {
    const id = ++lastId.current
    const req: MonteCarloRequest = { id, problem, weights: [...weights], method, concentration, n, seed }
    const done = (res: MonteCarloResponse) => {
      if (res.id !== lastId.current) return
      running.current = false
      setState((s) => ('result' in res ? { result: res.result, busy: false, failed: false } : { result: s.result, busy: false, failed: true }))
    }
    // A worker still busy with the previous inputs is stopped: its answer is no longer wanted.
    if (running.current && worker.current) {
      worker.current.terminate()
      worker.current = null
    }
    worker.current ??= createWorker()
    running.current = true
    setState((s) => (s.busy && !s.failed ? s : { ...s, busy: true, failed: false }))
    const w = worker.current
    if (!w) {
      // No workers here: compute after this frame, so the previous result and the status paint first.
      const t = window.setTimeout(() => done(runMonteCarlo(req)), 0)
      return () => window.clearTimeout(t)
    }
    w.onmessage = (e: MessageEvent<MonteCarloResponse>) => done(e.data)
    w.onerror = (e) => {
      e.preventDefault()
      done({ id, error: e.message })
    }
    w.postMessage(req)
    return undefined
  }, [problem, weights, method, concentration, n, seed])

  useEffect(
    () => () => {
      worker.current?.terminate()
      worker.current = null
      running.current = false
    },
    [],
  )

  return state
}
