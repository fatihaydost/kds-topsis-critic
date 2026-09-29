import { createContext, useContext } from 'react'
import type { ImportIssue } from '../../features/io'
import type { DraftProblem, Stage } from '../../state/workbench'

/** The last file import: its issues are shown while the problem is still the imported one. */
export type ImportReport = {
  problem: DraftProblem
  name: string
  kind: 'csv' | 'xlsx'
  /** Decimal separator the importer used for text numbers. */
  decimal: '.' | ','
  issues: ImportIssue[]
}

export type WorkbenchNav = {
  /** Switches stage; focuses `targetId` when given (a cell, a weight input), otherwise the stage. */
  goTo: (stage: Stage, targetId?: string) => void
  /** Per stage: the user tried to continue, so inline errors and the error summary show. */
  attempted: Readonly<Record<Stage, boolean>>
  setAttempted: (stage: Stage, value: boolean) => void
  importReport: ImportReport | null
  setImportReport: (report: ImportReport | null) => void
}

export const WorkbenchNavContext = createContext<WorkbenchNav | null>(null)

export function useWorkbenchNav(): WorkbenchNav {
  const nav = useContext(WorkbenchNavContext)
  if (!nav) throw new Error('useWorkbenchNav outside WorkbenchPage')
  return nav
}
