import { expect, test, type Page } from '@playwright/test'

/**
 * The moving path (docs/design/MOTION.md). Every other spec runs with reduced motion, where all durations are 0; these
 * run with motion on and check that each animation happens, ends where the reduced-motion render is, and leaves
 * nothing behind.
 */
test.use({ reducedMotion: 'no-preference' })

/** Running CSS transitions and animations inside `root` (whole document by default). */
const running = (page: Page, selector?: string) =>
  page.evaluate((sel) => {
    const root = sel ? document.querySelector(sel) : document
    return (root?.getAnimations({ subtree: true }) ?? []).filter((a) => a.playState === 'running').length
  }, selector)

/** Waits until every animation in the document has finished. */
const settled = (page: Page) => page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => null))))

/** Screen positions of the TOPSIS points on the method page. */
const topsisPoints = (page: Page) =>
  page.locator('#idea svg [role="radio"]').evaluateAll((els) =>
    els.map((el) => {
      const r = el.querySelector('circle')!.getBoundingClientRect()
      return { x: Math.round((r.x + r.width / 2) * 10) / 10, y: Math.round((r.y + r.height / 2) * 10) / 10 }
    }),
  )

test('floating layers animate out and then leave the DOM', async ({ page }) => {
  await page.goto('/methods/topsis')
  const trigger = page.getByRole('button', { name: /^Theme/ })
  await trigger.click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await settled(page)
  const exit = page.evaluate(
    () => new Promise<string>((resolve) => document.addEventListener('animationstart', (e) => resolve(e.animationName), { once: true })),
  )
  await page.keyboard.press('Escape')
  // The exit animation keeps it for a moment (Radix waits for animationend), then it is gone and focus is back.
  expect(await exit).toBe('kds-float-out')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test.describe('bottom sheet', () => {
  test.use({ viewport: { width: 1024, height: 900 } })

  test('slides in, slides out and leaves the DOM', async ({ page }) => {
    await page.goto('/app?example=krishnan-2021-smartphones&stage=weights')
    await page.getByRole('button', { name: 'Show explanation' }).click()
    const sheet = page.getByRole('dialog', { name: 'Explanation' })
    await expect(sheet).toBeVisible()
    expect(await sheet.evaluate((el) => el.getAnimations().map((a) => (a as CSSAnimation).animationName))).toEqual(['kds-sheet-in'])
    await settled(page)
    await page.keyboard.press('Escape')
    await expect(sheet).toHaveCount(0)
    await expect(page.locator('.bg-overlay')).toHaveCount(0)
  })
})

test('TOPSIS view switch moves the points and ends where the reduced-motion render puts them', async ({ page, browser }) => {
  await page.goto('/methods/topsis')
  await expect(page.locator('#idea svg [role="radio"]')).toHaveCount(3)
  await settled(page)
  const view = page.locator('#idea').getByRole('radio', { name: 'Two criteria' })
  await view.click()
  // The dots slide (object constancy); the lines of the new view fade in.
  const moving = await page.locator('#idea svg [role="radio"]').evaluateAll((els) =>
    els.map((el) => el.getAnimations().some((a) => (a as CSSTransition).transitionProperty === 'transform')),
  )
  expect(moving).toEqual([true, true, true])
  await settled(page)
  const animated = await topsisPoints(page)

  const reduced = await browser.newPage({ reducedMotion: 'reduce' })
  await reduced.goto('/methods/topsis')
  await expect(reduced.locator('#idea svg [role="radio"]')).toHaveCount(3)
  await reduced.locator('#idea').getByRole('radio', { name: 'Two criteria' }).click()
  expect(await topsisPoints(reduced)).toEqual(animated)
  await reduced.close()

  // The hidden view is out of sight and out of the accessibility tree once the crossfade is over.
  const layers = await page
    .locator('#idea svg g[data-view]')
    .evaluateAll((els) => els.map((el) => `${el.getAttribute('data-view')} ${getComputedStyle(el).visibility} ${getComputedStyle(el).opacity}`))
  expect(new Set(layers)).toEqual(new Set(['distances hidden 0', 'criteria visible 1']))
})

test('the first render and a resize do not animate the TOPSIS picture', async ({ page }) => {
  await page.goto('/methods/topsis')
  await expect(page.locator('#idea svg [role="radio"]')).toHaveCount(3)
  expect(await running(page, '#idea svg')).toBe(0)
  const before = await page.locator('#idea svg').getAttribute('width')
  await page.setViewportSize({ width: 520, height: 900 })
  await expect.poll(() => page.locator('#idea svg').getAttribute('width')).not.toBe(before)
  expect(await running(page, '#idea svg')).toBe(0)
})

test('the tab indicator slides and ends under the selected tab', async ({ page }) => {
  await page.goto('/methods/topsis')
  const list = page.locator('#details [role="tablist"]')
  await expect(list).toHaveAttribute('data-indicator', '')
  const bar = list.locator('[data-tabs-indicator]')
  const under = async (name: string) => {
    const tab = await list.getByRole('tab', { name }).boundingBox()
    const b = await bar.boundingBox()
    return { dx: Math.abs(b!.x - tab!.x), dw: Math.abs(b!.width - tab!.width), dy: Math.abs(b!.y + b!.height - (tab!.y + tab!.height)) }
  }
  // Placed at once on the first render, under the default tab.
  expect(await running(page, '#details [role="tablist"]')).toBe(0)
  for (const d of Object.values(await under('Use'))) expect(d).toBeLessThan(0.5)

  await list.getByRole('tab', { name: 'Pitfalls' }).click()
  expect(await bar.evaluate((el) => el.getAnimations().length)).toBe(1)
  await settled(page)
  for (const d of Object.values(await under('Pitfalls'))) expect(d).toBeLessThan(0.5)
  // The bar draws the underline now; the trigger's own border (the no-JS fallback) is off.
  expect(await list.getByRole('tab', { name: 'Pitfalls' }).evaluate((el) => getComputedStyle(el).borderBottomColor)).toBe('rgba(0, 0, 0, 0)')
})

test('a theme change lands in one frame, without transitions', async ({ page }) => {
  await page.goto('/methods/topsis') // light system scheme
  await page.getByRole('button', { name: /^Theme/ }).click()
  await settled(page)
  const result = page.evaluate(
    () =>
      new Promise<{ during: number; switching: boolean; after: boolean }>((resolve) => {
        const item = [...document.querySelectorAll<HTMLElement>('[role="menuitemradio"]')].find((el) => el.textContent?.includes('Dark'))!
        item.click()
        const switching = document.documentElement.hasAttribute('data-theme-switching')
        // Force the style update of the new theme now: controls with transition-colors would start transitions here.
        void document.documentElement.offsetHeight
        const count = () => document.getAnimations().filter((a) => a instanceof CSSTransition).length
        const during = count()
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => resolve({ during: during + count(), switching, after: document.documentElement.hasAttribute('data-theme-switching') })),
          ),
        )
      }),
  )
  expect(await result).toEqual({ during: 0, switching: true, after: false })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('a disclosure grows open where the browser can animate to auto', async ({ page }) => {
  await page.goto('/methods/topsis')
  // Open one step first so KaTeX is loaded and the measured step does not change size on its own.
  await page.locator('#algorithm details').first().locator('summary').click()
  await expect(page.locator('#algorithm .katex').first()).toBeVisible()
  await settled(page)
  // ::details-content transitions are not listed by getAnimations(): watch the height frame by frame instead.
  const heights = await page.locator('#algorithm details').nth(1).evaluate(
    (d) =>
      new Promise<number[]>((resolve) => {
        const out: number[] = []
        d.querySelector('summary')!.click()
        const frame = () => {
          out.push(Math.round(d.getBoundingClientRect().height))
          if (out.length < 30) requestAnimationFrame(frame)
          else resolve(out)
        }
        requestAnimationFrame(frame)
      }),
  )
  const final = heights[heights.length - 1]!
  expect(heights[0]).toBeLessThan(final)
  expect(heights.filter((h) => h > heights[0]! && h < final).length).toBeGreaterThan(2)
})

test('a new page starts at the top', async ({ page }) => {
  await page.goto('/methods/topsis')
  await page.locator('#combined a[href$="/methods/critic"]').first().scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, 400))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
  await page.locator('#combined a[href$="/methods/critic"]').first().click()
  await expect(page).toHaveURL(/\/methods\/critic$/)
  await expect(page.getByRole('heading', { level: 1, name: 'CRITIC' })).toBeVisible()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})
