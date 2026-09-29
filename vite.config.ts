import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * GitHub Pages has no SPA fallback. Serving a copy of index.html as 404.html makes deep links
 * (/kds-topsis-critic/app, /methods/topsis) boot the app without a hash router or a redirect.
 * Assets use the absolute base path, so the copy works at any depth.
 */
function spaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const index = resolve(outDir, 'index.html')
      if (existsSync(index)) copyFileSync(index, resolve(outDir, '404.html'))
    },
  }
}

export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages project site for the build and `vite preview`, root in dev.
  base: command === 'build' || isPreview ? '/kds-topsis-critic/' : '/',
  plugins: [react(), tailwindcss(), spaFallback()],
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
  },
}))
