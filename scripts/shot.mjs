#!/usr/bin/env node
/**
 * Screenshots of app routes with Playwright. Starts its own Vite server and stops it afterwards.
 *
 *   pnpm shot <route...> [--theme light|dark|both] [--width 1440[,390]] [--lang en|tr]
 *                        [--height 900] [--viewport] [--preview] [--out path]
 *
 *   pnpm shot /app                                  -> .shots/app-light-1440.png
 *   pnpm shot / /app /dev/ui --theme both --width 1440,390
 *   pnpm shot /app --theme dark --lang tr --out /tmp/app.png
 *
 * --preview   build output via `vite preview` (run `pnpm build` first; /dev/ui is dev-only).
 * --viewport  capture only the first screen instead of the full page.
 * --out       a .png path for a single shot, otherwise a directory (default .shots/).
 */
import { mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { createServer, preview } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function parseArgs(argv) {
  const opts = { routes: [], themes: ['light'], widths: [1440], lang: 'en', height: 900, fullPage: true, preview: false, out: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => {
      const v = argv[++i]
      if (v === undefined) throw new Error(`${a} needs a value`)
      return v
    }
    if (a === '--theme') {
      const v = next()
      opts.themes = v === 'both' ? ['light', 'dark'] : v.split(',')
    } else if (a === '--width') opts.widths = next().split(',').map(Number)
    else if (a === '--height') opts.height = Number(next())
    else if (a === '--lang') opts.lang = next()
    else if (a === '--out') opts.out = next()
    else if (a === '--viewport') opts.fullPage = false
    else if (a === '--preview') opts.preview = true
    else if (a.startsWith('--')) throw new Error(`unknown option ${a}`)
    else opts.routes.push(a.startsWith('/') ? a : `/${a}`)
  }
  if (opts.routes.length === 0) throw new Error('give at least one route, e.g. pnpm shot /app')
  for (const t of opts.themes) if (t !== 'light' && t !== 'dark') throw new Error(`theme must be light, dark or both, got ${t}`)
  for (const w of opts.widths) if (!Number.isFinite(w) || w < 200) throw new Error(`bad width ${w}`)
  if (opts.lang !== 'en' && opts.lang !== 'tr') throw new Error(`lang must be en or tr, got ${opts.lang}`)
  return opts
}

const slug = (route) => route.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'home'

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const shots = []
  for (const route of opts.routes) for (const theme of opts.themes) for (const width of opts.widths) shots.push({ route, theme, width })

  const single = shots.length === 1 && opts.out?.endsWith('.png')
  const outDir = resolve(root, single ? dirname(opts.out) : (opts.out ?? '.shots'))
  mkdirSync(outDir, { recursive: true })

  const server = opts.preview
    ? await preview({ root, logLevel: 'error', preview: { port: 0, strictPort: false, open: false } })
    : await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false, open: false, hmr: false } })
  if (!opts.preview) await server.listen()
  const base = server.resolvedUrls?.local?.[0]
  if (!base) throw new Error('server did not report a URL')

  const browser = await chromium.launch()
  const written = []
  try {
    for (const s of shots) {
      const context = await browser.newContext({
        viewport: { width: s.width, height: opts.height },
        deviceScaleFactor: 1,
        colorScheme: s.theme,
        reducedMotion: 'reduce',
      })
      // Explicit theme and language, as a user choice would store them.
      await context.addInitScript(
        ([theme, lang]) => {
          try {
            localStorage.setItem('kds.theme', theme)
            localStorage.setItem('kds.lang', lang)
          } catch {}
        },
        [s.theme, opts.lang],
      )
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text())
      })
      const url = new URL(s.route.replace(/^\//, ''), base).href
      await page.goto(url, { waitUntil: 'networkidle' })
      // Every route renders <main id="main">; lazy routes (e.g. /dev/ui) need an extra moment.
      await page.waitForSelector('#main', { timeout: 15000 }).catch(() => errors.push('no #main after 15 s'))
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => document.fonts.ready)
      const file = single
        ? resolve(root, opts.out)
        : join(outDir, `${slug(s.route)}-${s.theme}-${s.width}${opts.lang === 'en' ? '' : `-${opts.lang}`}.png`)
      await page.screenshot({ path: file, fullPage: opts.fullPage })
      written.push(file)
      if (errors.length) console.warn(`  ${s.route} (${s.theme}, ${s.width}): ${errors.length} console error(s)\n    ${errors.join('\n    ')}`)
      await context.close()
    }
  } finally {
    await browser.close()
    if (opts.preview) await new Promise((r) => server.httpServer.close(r))
    else await server.close()
  }
  for (const f of written) console.log(f)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
