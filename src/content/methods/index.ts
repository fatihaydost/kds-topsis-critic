import type { MethodContent, MethodFamily, MethodId } from '../types'
import { FAMILY_ORDER } from './catalog'
import { ahp } from './ahp'
import { aras } from './aras'
import { bwm } from './bwm'
import { cilos } from './cilos'
import { cocoso } from './cocoso'
import { codas } from './codas'
import { copras } from './copras'
import { critic } from './critic'
import { edas } from './edas'
import { electreI } from './electre-i'
import { electreIII } from './electre-iii'
import { entropy } from './entropy'
import { equal } from './equal'
import { lopcow } from './lopcow'
import { mabac } from './mabac'
import { marcos } from './marcos'
import { merec } from './merec'
import { moora } from './moora'
import { prometheeII } from './promethee-ii'
import { roc } from './roc'
import { saw } from './saw'
import { sd } from './sd'
import { swara } from './swara'
import { topsis } from './topsis'
import { vikor } from './vikor'
import { waspas } from './waspas'

export {
  ahp,
  aras,
  bwm,
  cilos,
  cocoso,
  codas,
  copras,
  critic,
  edas,
  electreI,
  electreIII,
  entropy,
  equal,
  lopcow,
  mabac,
  marcos,
  merec,
  moora,
  prometheeII,
  roc,
  saw,
  sd,
  swara,
  topsis,
  vikor,
  waspas,
}

/**
 * Every method card, keyed by id. The app imports ./catalog.ts (lists) and ./load.ts (one card per
 * chunk) instead; this module is for tests and the build (route metadata).
 */
export const methodContent: Readonly<Record<MethodId, MethodContent>> = {
  ahp,
  aras,
  bwm,
  cilos,
  cocoso,
  codas,
  copras,
  critic,
  edas,
  'electre-i': electreI,
  'electre-iii': electreIII,
  entropy,
  equal,
  lopcow,
  mabac,
  marcos,
  merec,
  moora,
  'promethee-ii': prometheeII,
  roc,
  saw,
  sd,
  swara,
  topsis,
  vikor,
  waspas,
}

export { FAMILY_ORDER }

export const allMethods: readonly MethodContent[] = Object.values(methodContent).sort(
  (a, b) => FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family) || a.year - b.year,
)

export const isMethodId = (id: string): id is MethodId => Object.hasOwn(methodContent, id)

export const getMethodContent = (id: string): MethodContent | undefined => (isMethodId(id) ? methodContent[id] : undefined)

export const methodsByFamily = (family: MethodFamily): MethodContent[] => allMethods.filter((m) => m.family === family)
