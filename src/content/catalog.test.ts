import { describe, expect, it } from 'vitest'
import { allMethods as metaList, isMethodId as isMetaId, methodMeta } from './methods/catalog'
import { allMethods, methodContent } from './methods'
import { loadMethod } from './methods/load'
import type { MethodId } from './types'

describe('method catalogue (the light list the app uses)', () => {
  it('has one row per card with the same id, name, family, status and year', () => {
    expect(Object.keys(methodMeta).sort()).toEqual(Object.keys(methodContent).sort())
    for (const m of allMethods) {
      expect(methodMeta[m.id], m.id).toEqual({ id: m.id, name: m.name, family: m.family, status: m.status, year: m.year })
    }
  })

  it('keeps the order of the full list', () => {
    expect(metaList.map((m) => m.id)).toEqual(allMethods.map((m) => m.id))
  })

  it('knows the same ids', () => {
    expect(isMetaId('topsis')).toBe(true)
    expect(isMetaId('toString')).toBe(false)
  })

  it('loads each card on its own', async () => {
    for (const id of Object.keys(methodContent) as MethodId[]) {
      expect(await loadMethod(id), id).toBe(methodContent[id])
    }
  })
})
