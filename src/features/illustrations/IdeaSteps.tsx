import { X } from '@phosphor-icons/react'
import { useEffect, useReducer, useRef, type KeyboardEvent } from 'react'
import { Button } from '../../ui/Button'
import { cn } from '../../ui/cn'
import { IconButton } from '../../ui/IconButton'
import { STEPS_OFF, stepsReducer, type StepsState } from './ideaSteps'

export type IdeaStepsControl = StepsState & {
  count: number
  start: () => void
  next: () => void
  back: () => void
  close: () => void
}

/**
 * "Step through the idea" for a method picture: `step` (null = the full drawing) and `explain` (use the explain pace)
 * go to the picture, the control to <IdeaSteps>. No autoplay, no loop: every step is the reader's click or key.
 */
export function useIdeaSteps(count: number): IdeaStepsControl {
  const [state, dispatch] = useReducer(stepsReducer(count), STEPS_OFF)
  // Keep the explain pace for the frame in which the mode closes (its transitions take that pace), then drop it.
  useEffect(() => {
    if (state.step !== null || !state.explain) return
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(() => dispatch({ type: 'settled' }))))
    return () => cancelAnimationFrame(id)
  }, [state])
  return {
    ...state,
    count,
    start: () => dispatch({ type: 'start' }),
    next: () => dispatch({ type: 'next' }),
    back: () => dispatch({ type: 'back' }),
    close: () => dispatch({ type: 'close' }),
  }
}

export type IdeaStepsLabels = {
  /** The button that starts the mode ("Step through"). */
  start: string
  /** Accessible name of the control group. */
  group: string
  back: string
  next: string
  finish: string
  close: string
  /** "Step 2 of 5", for screen readers; the visible counter is "2 / 5". */
  progress: (n: number, count: number) => string
}

/**
 * The controls under the picture: one "Step through" button, or Back, the counter with one segment per step,
 * Next (Finish on the last step) and Close, over the step's one sentence (a polite live region, replaced at once).
 * Keys inside the group: Left and Right move, Escape closes. Focus goes to Next on start and back to the start
 * button when the mode closes.
 */
export function IdeaSteps({ control, sentences, labels, className }: { control: IdeaStepsControl; sentences: readonly string[]; labels: IdeaStepsLabels; className?: string | undefined }) {
  const { step, count } = control
  const on = step !== null
  const startRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const wasOn = useRef(false)
  useEffect(() => {
    if (on && !wasOn.current) nextRef.current?.focus()
    if (!on && wasOn.current) startRef.current?.focus()
    wasOn.current = on
  }, [on])

  // The live region stays in the DOM (empty outside the mode; the keys keep it the same node in both layouts), so the
  // first sentence is announced too. It holds only the current sentence; the visible ones below are aria-hidden.
  const live = (
    <p key="live" aria-live="polite" className="sr-only">
      {on ? sentences[step] : ''}
    </p>
  )
  if (!on) {
    return (
      <div className={className}>
        <Button key="start" ref={startRef} size="sm" onClick={control.start}>
          {labels.start}
        </Button>
        {live}
      </div>
    )
  }

  const last = step === count - 1
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' && !last) control.next()
    else if (e.key === 'ArrowLeft') control.back()
    else if (e.key === 'Escape') control.close()
    else return
    e.preventDefault()
  }
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div key="group" role="group" aria-label={labels.group} onKeyDown={onKeyDown} className="flex flex-wrap items-center gap-2">
        {/* aria-disabled, not disabled: a disabled button would drop the focus that just pressed it. */}
        <Button size="sm" aria-disabled={step === 0} onClick={() => step > 0 && control.back()} className="aria-disabled:opacity-50">
          {labels.back}
        </Button>
        <span className="num flex items-center gap-2 px-1 text-13 text-text-2">
          <span aria-hidden>
            {step + 1} / {count}
          </span>
          <span className="sr-only">{labels.progress(step + 1, count)}</span>
          <span aria-hidden className="flex gap-1">
            {Array.from({ length: count }, (_, k) => (
              <span key={k} className={cn('h-0.5 w-4 transition-colors', k <= step ? 'bg-accent' : 'bg-line-strong')} />
            ))}
          </span>
        </span>
        <Button ref={nextRef} size="sm" variant="primary" onClick={control.next}>
          {last ? labels.finish : labels.next}
        </Button>
        <IconButton size="sm" aria-label={labels.close} icon={<X />} onClick={control.close} className="ml-auto" />
      </div>
      {/* Every sentence in one grid cell, only the current one visible: the cell is as tall as the longest at any
          width and in any language, so the text below never jumps between steps. */}
      <div key="sentences" aria-hidden className="grid max-w-[65ch] text-14 text-text" data-step-sentences="">
        {sentences.map((text, k) => (
          <p key={k} className={cn('[grid-area:1/1]', k !== step && 'invisible')} data-current={k === step || undefined}>
            {text}
          </p>
        ))}
      </div>
      {live}
    </div>
  )
}
