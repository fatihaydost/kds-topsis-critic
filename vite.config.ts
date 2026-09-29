import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { build, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * GitHub Pages has no SPA fallback. Serving a copy of index.html as 404.html makes deep links
 * (/kds-topsis-critic/app, /methods/topsis) boot the app without a hash router or a redirect.
 * Assets use the absolute base path, so the copy works at any depth.
 *
 * Then index.html (served only for the home page) gets the landing page prerendered in both
 * languages (src/app/prerender.tsx, through an SSR build of the same config): English in #root,
 * Turkish in a <template> that an inline script swaps in before the first paint when the page
 * opens in Turkish. main.tsx replaces it with the live app. The 404 copy is made first, so deep
 * links never show the landing markup.
 */
function spaFallback(): Plugin {
  let outDir = 'dist'
  let root = process.cwd()
  let base = '/'
  let isSsr = false
  return {
    name: 'spa-404-fallback-and-prerender',
    apply: 'build',
    configResolved(config) {
      root = config.root
      base = config.base
      outDir = resolve(config.root, config.build.outDir)
      isSsr = !!config.build.ssr
    },
    async closeBundle() {
      if (isSsr) return
      const index = resolve(outDir, 'index.html')
      if (!existsSync(index)) return
      copyFileSync(index, resolve(outDir, '404.html'))

      // Inside node_modules so the SSR bundle resolves react and friends; per process, so two builds do not collide.
      const ssrOut = resolve(root, `node_modules/.prerender-${process.pid}`)
      await build({
        configFile: resolve(root, 'vite.config.ts'),
        logLevel: 'warn',
        build: { ssr: 'src/app/prerender.tsx', outDir: ssrOut, emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'prerender.mjs' } } },
      })
      const { render } = (await import(pathToFileURL(resolve(ssrOut, 'prerender.mjs')).href + `?t=${Date.now()}`)) as {
        render: (lang: 'en' | 'tr') => Promise<string>
      }
      const en = await render('en')
      const tr = await render('tr')
      rmSync(ssrOut, { recursive: true, force: true })
      const swap = `<script>
      // Prerendered home page: Turkish markup when the page opens in Turkish, none off the home path.
      ;(function () {
        var r = document.getElementById('root')
        var p = location.pathname
        if (p !== '${base}' && p !== '${base}index.html') r.textContent = ''
        else if (document.documentElement.lang === 'tr') r.innerHTML = document.getElementById('prerender-tr').innerHTML
      })()
    </script>`
      const html = readFileSync(index, 'utf8')
      const out = html.replace(
        '<div id="root"></div>',
        // Charts measure their container in the browser; the server draws them at the 640 px fallback,
        // so they stay hidden (at their final height, no layout shift) until the app has measured.
        `<style>#root[data-prerender] svg[width="640"] { visibility: hidden; max-width: 100%; }</style>\n    ` +
          `<div id="root" data-prerender>${en}</div>\n    <template id="prerender-tr">${tr}</template>\n    ${swap}`,
      )
      if (out === html) throw new Error('prerender: <div id="root"></div> not found in index.html')
      writeFileSync(index, out)
    },
  }
}

/**
 * Shortens the landing page's critical path (LCP is its h1). In the built index.html:
 * - preload the Plex Sans faces the first screen uses (400 lead, 500 nav and buttons, 600 h1):
 *   latin always, latin-ext only when the page opens in Turkish (ğ ş İ);
 * - link the Landing chunk's CSS as stylesheets, so the prerendered home page paints styled.
 * The home page is prerendered (spaFallback), so its first paint needs no script. Preloading the
 * Landing chunk as well was measured: it only competes with the CSS and fonts (LCP 2.9 s against
 * 2.6 s in Lighthouse mobile), so main.tsx loads it when it starts.
 */
function criticalPreloads(): Plugin {
  let base = '/'
  return {
    name: 'critical-preloads',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html
        const url = (file: string) => base + file
        const font = (subset: string, weight: number) =>
          Object.keys(bundle).find((f) => new RegExp(`ibm-plex-sans-${subset}-${weight}-normal-[^/]*\\.woff2$`).test(f))
        const fonts = (subset: string) => [400, 500, 600].map((w) => font(subset, w)).filter((f): f is string => !!f).map(url)

        const landing = Object.values(bundle).find((c) => c.type === 'chunk' && c.facadeModuleId?.endsWith('/src/app/landing/Landing.tsx'))
        const seen = new Set<string>()
        const css = new Set<string>()
        const walk = (file: string) => {
          const c = bundle[file]
          if (!c || c.type !== 'chunk' || c.isEntry || seen.has(file)) return
          seen.add(file)
          c.viteMetadata?.importedCss.forEach((f) => css.add(f))
          c.imports.forEach(walk)
        }
        if (landing) walk(landing.fileName)

        const data = JSON.stringify({ latin: fonts('latin'), ext: fonts('latin-ext') })
        // The landing chunk's CSS (chart and diagram styles, about 3 kB) as normal stylesheets, so the
        // prerendered page paints styled. Vite's chunk loader finds them and does not add them twice.
        const styles = [...css].map((f) => `<link rel="stylesheet" crossorigin href="${url(f)}">`).join('\n    ')
        const script = `<script>
      // Critical preloads (vite.config.ts criticalPreloads).
      ;(function (p) {
        var h = document.head
        function add(rel, href, as) {
          var l = document.createElement('link')
          l.rel = rel
          l.href = href
          if (as) l.as = as
          if (as === 'font') { l.type = 'font/woff2'; l.crossOrigin = '' }
          h.appendChild(l)
        }
        p.latin.forEach(function (f) { add('preload', f, 'font') })
        if (document.documentElement.lang === 'tr') p.ext.forEach(function (f) { add('preload', f, 'font') })
      })(${data})
    </script>`
        // After the theme and language script, so <html lang> is already set.
        return html.replace('</head>', `  ${styles}\n    ${script}\n  </head>`)
      },
    },
  }
}

export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages project site for the build and `vite preview`, root in dev.
  base: command === 'build' || isPreview ? '/kds-topsis-critic/' : '/',
  plugins: [react(), tailwindcss(), criticalPreloads(), spaFallback()],
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
  },
}))
