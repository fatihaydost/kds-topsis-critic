import { readFileSync } from 'node:fs'
import { expect, test, type Locator, type Page } from '@playwright/test'
import * as XLSX from 'xlsx'
import { critic, topsis, type CriterionType } from '../../src/core'
import { getExample } from '../../src/data/examples'

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), 'utf8'))
const krishnan = fixture('critic-krishnan2021') as { expected: { weights: number[] } }
const legacy = fixture('legacy-python-critic-topsis') as { matrix: number[][]; types: string[]; expected: { closeness: number[] } }

const f4 = (x: number) => x.toFixed(4)

/** Closeness per alternative name, read from the ranking table (rows are in rank order). */
async function closenessByName(page: Page): Promise<Record<string, string>> {
  const rows = page.getByTestId('ranking-row')
  await expect(rows.first()).toBeVisible()
  const out: Record<string, string> = {}
  for (const row of await rows.all()) {
    const name = (await row.locator('th').innerText()).trim()
    out[name] = (await row.getByTestId('closeness').innerText()).trim()
  }
  return out
}

/** The focused element's label and text. */
const focusedLabel = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    return el ? `${el.getAttribute('aria-label') ?? ''} ${el.innerText ?? ''}`.trim() : ''
  })

/** Presses Tab until the focused element's text or label matches, like a keyboard user would. */
async function tabTo(page: Page, name: string | RegExp, max = 120, key = 'Tab'): Promise<void> {
  for (let k = 0; k < max; k++) {
    await page.keyboard.press(key)
    const label = await focusedLabel(page)
    if (typeof name === 'string' ? label.includes(name) : name.test(label)) return
  }
  throw new Error(`Tab never reached ${String(name)}`)
}

const stageHeading = (page: Page, name: string): Locator => page.getByRole('heading', { level: 1, name })

test('example -> CRITIC -> TOPSIS: weights match Krishnan et al. (2021), closeness matches the core', async ({ page }) => {
  await page.goto('/app')
  await page.getByRole('button', { name: 'Load example', exact: true }).first().click()
  await expect(page.getByRole('grid', { name: 'Decision matrix' })).toBeVisible()
  await expect(page.getByText('Example data from Krishnan et al. (2021)')).toBeVisible()

  await page.getByRole('button', { name: 'Continue to weights' }).click()
  await expect(stageHeading(page, 'Weights')).toBeVisible()
  const weightCells = page.locator('table').first().locator('tbody tr td:last-child')
  await expect(weightCells).toHaveText(krishnan.expected.weights.map(f4))

  await page.getByRole('button', { name: 'Continue to ranking' }).click()
  await expect(stageHeading(page, 'Ranking')).toBeVisible()

  const ex = getExample('krishnan-2021-smartphones')!
  const problem = {
    alternatives: ex.alternatives,
    criteria: ex.criteria.map((c) => ({ name: c.name.en, type: c.type })),
    matrix: ex.matrix,
  }
  const w = critic.compute(problem, {}).weights
  const r = topsis.compute(problem, w, {})
  const expected = Object.fromEntries(ex.alternatives.map((a, i) => [a, f4(r.scores[i]!)]))
  expect(await closenessByName(page)).toEqual(expected)

  await page.getByRole('button', { name: 'Continue to results' }).click()
  await expect(stageHeading(page, 'Results')).toBeVisible()
  expect(await closenessByName(page)).toEqual(expected)
  // The worked calculation: 7 CRITIC steps + 7 TOPSIS steps, with formulas.
  await expect(page.locator('section[data-step]')).toHaveCount(14)
  await expect(page.locator('section[data-step] .katex').first()).toBeVisible()
})

test('import a CSV -> CRITIC -> TOPSIS: closeness matches the legacy Python fixture', async ({ page }) => {
  const names = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
  const alts = legacy.matrix.map((_, i) => `A${i + 1}`)
  const csv = [
    ['Alternative', ...names].join(';'),
    ['Type', ...legacy.types].join(';'),
    ...legacy.matrix.map((row, i) => [alts[i], ...row].join(';')),
  ].join('\n')

  await page.goto('/app')
  await page.locator('input[type="file"]').setInputFiles({ name: 'legacy.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) })
  await expect(page.getByText('Imported legacy.csv (alternatives: 7, criteria: 6)')).toBeVisible()

  await page.getByRole('button', { name: 'Continue to weights' }).click()
  await page.getByRole('button', { name: 'Continue to ranking' }).click()
  const expected = Object.fromEntries(alts.map((a, i) => [a, f4(legacy.expected.closeness[i]!)]))
  expect(await closenessByName(page)).toEqual(expected)
  // Same numbers as the core on the same input.
  const p = { alternatives: alts, criteria: names.map((name, j) => ({ name, type: legacy.types[j] as CriterionType })), matrix: legacy.matrix }
  const core = topsis.compute(p, critic.compute(p, {}).weights, {})
  expect(Object.values(expected)).toEqual(core.scores.map(f4))
})

test('an empty cell blocks Continue with a GOV.UK summary whose link focuses the cell', async ({ page }) => {
  await page.goto('/app?example=krishnan-2021-smartphones')
  const cell = page.locator('#wb-cell-1-2')
  await cell.click()
  await page.keyboard.press('Delete')
  await page.getByRole('button', { name: 'Continue to weights' }).click()

  const summary = page.getByRole('alert').filter({ hasText: 'There is a problem' })
  await expect(summary).toBeFocused()
  const link = summary.getByRole('link', { name: 'Enter a number for B on Pixel density.' })
  await link.click()
  await expect(cell).toBeFocused()
  // Typing now edits that cell, not the one the grid had before.
  await page.keyboard.type('401')
  await page.keyboard.press('Enter')
  await expect(cell).toHaveText('401')

  // Later stages explain what blocks them instead of failing.
  await page.locator('#wb-cell-0-0').click()
  await page.keyboard.press('Delete')
  await page.locator('nav[aria-label="Stages"] button', { hasText: 'Ranking' }).click()
  await expect(page.getByText('The decision matrix has problems')).toBeVisible()
  await page.getByRole('button', { name: 'Enter a number for A on Price.' }).click()
  await expect(stageHeading(page, 'Data')).toBeVisible()
  await expect(page.locator('#wb-cell-0-0')).toBeFocused()
})

test('manual weights: live total, specific sum error, normalize', async ({ page }) => {
  await page.goto('/app?example=opricovic-tzeng-2004-f&stage=weights')
  await expect(page.getByRole('radio', { name: 'Manual' })).toHaveAttribute('aria-checked', 'true')
  const w1 = page.locator('#wb-weight-1')
  await w1.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('0.45')
  await w1.blur()
  await expect(page.getByText('Weights sum to 0.950, they must sum to 1.')).toBeVisible()
  await page.getByRole('button', { name: 'Continue to ranking' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'There is a problem' })).toBeFocused()
  await page.getByRole('button', { name: 'Normalize to 1' }).click()
  await expect(page.getByText('Weights sum to 1.')).toBeVisible()
  await expect(page.locator('#wb-weight-0')).toHaveValue('0.5263')
})

test('copy a step as TSV and LaTeX', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/app?example=krishnan-2021-smartphones&stage=results')
  const block = page.locator('section[data-step="critic.weights"]')
  await block.getByRole('button', { name: 'Copy step 7 as TSV' }).click()
  await expect(block.getByRole('button', { name: 'Copy step 7 as TSV' })).toHaveText('Copied')
  const tsv = await page.evaluate(() => navigator.clipboard.readText())
  expect(tsv.split('\n')[0]).toBe('\tPrice\tScreen size\tPixel density\tThickness\tMass')
  expect(tsv.split('\n')[1]!.startsWith('w\t0.187')).toBe(true)
  await block.getByRole('button', { name: 'Copy step 7 as LaTeX' }).click()
  const tex = await page.evaluate(() => navigator.clipboard.readText())
  expect(tex).toContain('\\toprule')
  expect(tex).toContain('$w_j$ & 0.1872')
  await expect(block.getByRole('button', { name: 'Copy step 7 as TSV' })).toHaveText('Copy TSV', { timeout: 3000 })
})

test('download the full calculation as .xlsx', async ({ page }) => {
  await page.goto('/app?example=krishnan-2021-smartphones&stage=results')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download full calculation (.xlsx)' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('kds-calculation.xlsx')
  const path = await download.path()
  const wb = XLSX.read(readFileSync(path))
  expect(wb.SheetNames).toEqual(['Data', 'Weights', 'Ranking', 'Calculation'])
})

test('the whole flow works with the keyboard alone', async ({ page }) => {
  await page.goto('/app')
  await tabTo(page, /^Load example$/)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('grid', { name: 'Decision matrix' })).toBeVisible()
  await tabTo(page, 'Continue to weights', 200)
  await page.keyboard.press('Enter')
  await expect(stageHeading(page, 'Weights')).toBeVisible()
  // The stage takes focus, so Tab continues from the top of the new stage.
  await expect(page.locator('#main')).toBeFocused()
  await tabTo(page, /^CRITIC$/)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: 'Manual' })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('radio', { name: 'Manual' })).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('radio', { name: 'CRITIC' })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('radio', { name: 'CRITIC' })).toHaveAttribute('aria-checked', 'true')
  await tabTo(page, 'Show the calculation')
  await page.keyboard.press('Enter')
  await expect(page.locator('section[data-step]')).toHaveCount(7)
  await tabTo(page, 'Continue to ranking')
  await page.keyboard.press('Enter')
  await expect(stageHeading(page, 'Ranking')).toBeVisible()
  await tabTo(page, 'Continue to results')
  await page.keyboard.press('Enter')
  await expect(stageHeading(page, 'Results')).toBeVisible()
  await tabTo(page, 'Download data (.csv)')
  // The rail is reachable too: Shift+Tab back up to the stage list and open Data.
  await tabTo(page, /^Data\s/, 40, 'Shift+Tab')
  await page.keyboard.press('Enter')
  await expect(stageHeading(page, 'Data')).toBeVisible()
})
