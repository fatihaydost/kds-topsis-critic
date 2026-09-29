import type { MethodContent, MethodId } from '../types'

/**
 * One chunk per method card, so a method page loads its own card only (./catalog.ts has the fields
 * that lists need). Tests and the build-time route metadata import ./index.ts, which has them all.
 */
const LOADERS: Record<MethodId, () => Promise<MethodContent>> = {
  ahp: () => import('./ahp').then((m) => m.ahp),
  aras: () => import('./aras').then((m) => m.aras),
  bwm: () => import('./bwm').then((m) => m.bwm),
  cilos: () => import('./cilos').then((m) => m.cilos),
  cocoso: () => import('./cocoso').then((m) => m.cocoso),
  codas: () => import('./codas').then((m) => m.codas),
  copras: () => import('./copras').then((m) => m.copras),
  critic: () => import('./critic').then((m) => m.critic),
  edas: () => import('./edas').then((m) => m.edas),
  'electre-i': () => import('./electre-i').then((m) => m.electreI),
  'electre-iii': () => import('./electre-iii').then((m) => m.electreIII),
  entropy: () => import('./entropy').then((m) => m.entropy),
  equal: () => import('./equal').then((m) => m.equal),
  lopcow: () => import('./lopcow').then((m) => m.lopcow),
  mabac: () => import('./mabac').then((m) => m.mabac),
  marcos: () => import('./marcos').then((m) => m.marcos),
  merec: () => import('./merec').then((m) => m.merec),
  moora: () => import('./moora').then((m) => m.moora),
  'promethee-ii': () => import('./promethee-ii').then((m) => m.prometheeII),
  roc: () => import('./roc').then((m) => m.roc),
  saw: () => import('./saw').then((m) => m.saw),
  sd: () => import('./sd').then((m) => m.sd),
  swara: () => import('./swara').then((m) => m.swara),
  topsis: () => import('./topsis').then((m) => m.topsis),
  vikor: () => import('./vikor').then((m) => m.vikor),
  waspas: () => import('./waspas').then((m) => m.waspas),
}

const cache = new Map<MethodId, Promise<MethodContent>>()

/** The card of one method. The same promise for the same id, so React's `use()` can suspend on it. */
export function loadMethod(id: MethodId): Promise<MethodContent> {
  let p = cache.get(id)
  if (!p) {
    const loading: Promise<MethodContent> & { status?: string; value?: MethodContent } = LOADERS[id]().then((m) => {
      // React's convention for a settled thenable: use() then reads the value without suspending,
      // so a prerendered method page is replaced in the first commit (src/main.tsx).
      loading.status = 'fulfilled'
      loading.value = m
      return m
    })
    p = loading
    cache.set(id, p)
  }
  return p
}
