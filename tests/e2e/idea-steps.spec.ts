import { expect, test, type Page } from '@playwright/test'

/**
 * "Step through" on the method pages (IdeaSteps): the picture transforms step by step, the last step is the full
 * picture, and the controls work by mouse and keyboard, with and without motion.
 */

/** Everything drawn in the idea picture: tag, visibility, opacity, box, fill and CSS d of each SVG element. */
const drawing = (page: Page) =>
  page
    .locator('#idea figure')
    .first()
    .evaluate((figure) => {
      const svg = figure.querySelector('svg')!
      const origin = svg.getBoundingClientRect()
      const r = (v: number) => Math.round(v * 10) / 10
      return [...svg.querySelectorAll('*')]
        .filter((el) => !el.closest('defs') && el.tagName !== 'title')
        .map((el) => {
          const cs = getComputedStyle(el)
          const b = el.getBoundingClientRect()
          const box = [b.x - origin.x, b.y - origin.y, b.width, b.height].map(r).join(',')
          return `${el.tagName} ${cs.visibility} ${cs.opacity} ${box} ${cs.fill} ${cs.stroke} ${cs.fontWeight} ${cs.getPropertyValue('d')} ${el.textContent?.trim().slice(0, 20) ?? ''}`
        })
    })

const settled = (page: Page) => page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => null))))

const counter = (page: Page) => page.locator('#idea [role="group"]').getByText(/^\d \/ \d$/)
const sentence = (page: Page) => page.locator('#idea p[aria-live="polite"]').last()

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test.describe(`motion ${reducedMotion}`, () => {
    test.use({ reducedMotion })

    test('TOPSIS: five steps, the last one is the full picture, Finish keeps it', async ({ page }) => {
      await page.goto('/methods/topsis')
      await expect(page.locator('#idea svg [role="radio"]')).toHaveCount(3)
      await settled(page)
      const full = await drawing(page)

      await page.getByRole('button', { name: 'Step through' }).click()
      await expect(counter(page)).toHaveText('1 / 5')
      await expect(sentence(page)).toHaveText('Each alternative is a point: its weighted normalized values on two criteria.')
      // Step 1 is the criterion plane without A+, A- or the distance lines.
      await expect(page.locator('#idea').getByRole('radio', { name: 'Two criteria' })).toHaveAttribute('aria-checked', 'true')
      await settled(page)
      expect(await page.locator('#idea [data-dist="plus"]').evaluate((el) => getComputedStyle(el).visibility)).toBe('hidden')

      for (const n of [2, 3, 4, 5]) {
        await page.getByRole('button', { name: 'Next' }).click()
        await expect(counter(page)).toHaveText(`${n} / 5`)
      }
      await expect(sentence(page)).toHaveText('C = D− / (D+ + D−) is the same along each ray; top left is best.')
      await settled(page)
      expect(await drawing(page)).toEqual(full)

      await page.getByRole('button', { name: 'Finish' }).click()
      await expect(page.getByRole('button', { name: 'Step through' })).toBeFocused()
      await settled(page)
      expect(await drawing(page)).toEqual(full)
    })

    test('CRITIC: four steps, information then weight, the last one is the full picture', async ({ page }) => {
      await page.goto('/methods/critic')
      await expect(page.locator('#idea svg')).toBeVisible()
      await settled(page)
      const full = await drawing(page)

      await page.getByRole('button', { name: 'Step through' }).click()
      await expect(counter(page)).toHaveText('1 / 4')
      await page.getByRole('button', { name: 'Next' }).click()
      await page.getByRole('button', { name: 'Next' }).click()
      await expect(counter(page)).toHaveText('3 / 4')
      // Information C = σ × Σ(1 − ρ): Krishnan et al. (2021), Thickness 0.4161 × 5.8868.
      await expect(page.locator('#idea svg').getByText('Information C')).toBeVisible()
      await expect(page.locator('#idea svg').getByText('2.4494')).toBeAttached()
      await page.getByRole('button', { name: 'Next' }).click()
      await expect(page.locator('#idea svg').getByText('0.2599')).toBeAttached()
      await settled(page)
      expect(await drawing(page)).toEqual(full)
    })

    test('keyboard: arrows move, Escape closes and gives the focus back', async ({ page }) => {
      await page.goto('/methods/topsis')
      await expect(page.locator('#idea svg [role="radio"]')).toHaveCount(3)
      await page.getByRole('button', { name: 'Step through' }).click()
      await expect(page.getByRole('button', { name: 'Next' })).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowRight')
      await expect(counter(page)).toHaveText('3 / 5')
      await page.keyboard.press('ArrowLeft')
      await expect(counter(page)).toHaveText('2 / 5')
      // Back to the first step keeps the focus on Back, which is now aria-disabled (a disabled button would drop it).
      await page.getByRole('button', { name: 'Back' }).click()
      await expect(counter(page)).toHaveText('1 / 5')
      await expect(page.getByRole('button', { name: 'Back' })).toHaveAttribute('aria-disabled', 'true')
      await expect(page.getByRole('button', { name: 'Back' })).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(page.locator('#idea [role="group"]')).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Step through' })).toBeFocused()
    })
  })
}

test('while stepping, the points and the view switch are inert', async ({ page }) => {
  await page.goto('/methods/topsis')
  await expect(page.locator('#idea svg [role="radio"]')).toHaveCount(3)
  await page.getByRole('button', { name: 'Step through' }).click()
  for (let k = 0; k < 2; k++) await page.getByRole('button', { name: 'Next' }).click()
  const a2 = page.locator('#idea svg [role="radio"]').nth(1)
  await a2.click({ force: true })
  await expect(a2).toHaveAttribute('aria-checked', 'false')
  await expect(page.locator('#idea').getByRole('radio', { name: 'Distances' })).toBeDisabled()
  // Closing gives both back.
  await page.getByRole('button', { name: 'Close the steps' }).click()
  await a2.click()
  await expect(a2).toHaveAttribute('aria-checked', 'true')
})

test.describe('pace', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('nothing moves before the reader asks; a step moves at the explain pace', async ({ page }) => {
    await page.goto('/methods/topsis')
    await expect(page.locator('#idea svg [role="radio"]')).toHaveCount(3)
    expect(await page.locator('#idea svg').evaluate((svg) => svg.getAnimations({ subtree: true }).length)).toBe(0)
    // Record transitions with their duration (awaited setup, read after the action: no timing window).
    await page.evaluate(() => {
      const w = window as unknown as { __runs: string[] }
      w.__runs = []
      document.addEventListener('transitionrun', (e) => {
        const el = e.target as Element
        if (el.closest('#idea svg')) w.__runs.push(`${e.propertyName} ${getComputedStyle(el).transitionDuration}`)
      })
    })
    await page.getByRole('button', { name: 'Step through' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await settled(page)
    const runs = await page.evaluate(() => (window as unknown as { __runs: string[] }).__runs)
    // The dots moved into the criterion plane and A+ / A- faded in, all in 450 ms (--dur-explain).
    expect(runs.filter((r) => r.startsWith('transform')).length).toBeGreaterThanOrEqual(3)
    expect(runs.filter((r) => r.startsWith('opacity')).every((r) => r.split(' ')[1]!.split(',').includes('0.45s'))).toBe(true)
    expect(runs.some((r) => r.startsWith('opacity'))).toBe(true)
  })
})
