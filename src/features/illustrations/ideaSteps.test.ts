import { describe, expect, it } from 'vitest'
import { STEPS_OFF, stepsReducer, type StepsAction, type StepsState } from './ideaSteps'

const run = (count: number, actions: StepsAction['type'][], from: StepsState = STEPS_OFF) =>
  actions.reduce((s, type) => stepsReducer(count)(s, { type } as StepsAction), from)

describe('stepsReducer', () => {
  it('starts at the first step with the explain pace', () => {
    expect(run(5, ['start'])).toEqual({ step: 0, explain: true })
  })
  it('walks forward and back within the steps', () => {
    expect(run(5, ['start', 'next', 'next']).step).toBe(2)
    expect(run(5, ['start', 'next', 'back']).step).toBe(0)
    expect(run(5, ['start', 'back', 'back']).step).toBe(0)
  })
  it('finishes on Next at the last step: the mode closes, the pace settles later', () => {
    const last = run(4, ['start', 'next', 'next', 'next'])
    expect(last.step).toBe(3)
    const done = run(4, ['next'], last)
    expect(done).toEqual({ step: null, explain: true })
    expect(run(4, ['settled'], done)).toEqual(STEPS_OFF)
  })
  it('closes from any step; settled does nothing while stepping', () => {
    expect(run(5, ['start', 'next', 'close'])).toEqual({ step: null, explain: true })
    expect(run(5, ['start', 'settled'])).toEqual({ step: 0, explain: true })
  })
  it('ignores moves outside the mode and an empty story', () => {
    expect(run(5, ['next', 'back', 'close'])).toEqual(STEPS_OFF)
    expect(run(0, ['start'])).toEqual(STEPS_OFF)
  })
})
