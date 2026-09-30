/**
 * State of "step through the idea" (IdeaSteps.tsx), as a pure reducer so it can be tested without a DOM.
 * - `step`: null outside the mode (the full drawing), else 0 .. count - 1. The last step is the full drawing.
 * - `explain`: the drawing uses the explain durations (MOTION.md). On while stepping and for the frames in which the
 *   mode closes, so the way back to the full drawing moves at the same pace; `settled` turns it off afterwards.
 */
export type StepsState = { step: number | null; explain: boolean }

export type StepsAction = { type: 'start' } | { type: 'next' } | { type: 'back' } | { type: 'close' } | { type: 'settled' }

export const STEPS_OFF: StepsState = { step: null, explain: false }

export function stepsReducer(count: number) {
  return (state: StepsState, action: StepsAction): StepsState => {
    const { step } = state
    switch (action.type) {
      case 'start':
        return count > 0 ? { step: 0, explain: true } : state
      case 'next':
        if (step === null) return state
        // Next on the last step is "Finish": the mode closes, the drawing (already the full one) stays.
        return step < count - 1 ? { step: step + 1, explain: true } : { step: null, explain: true }
      case 'back':
        return step !== null && step > 0 ? { step: step - 1, explain: true } : state
      case 'close':
        return step === null ? state : { step: null, explain: true }
      case 'settled':
        return step === null && state.explain ? STEPS_OFF : state
    }
  }
}
