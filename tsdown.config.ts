import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const dirname = import.meta.dirname

const config: UserConfig = defineConfig({
  entry: [
    './src/index.ts',
    './src/definition.ts',
    './src/context.ts',
    './src/renderer.ts',
    './src/generator.ts'
  ],
  outDir: 'lib',
  clean: true,
  publint: true,
  dts: true,
  hooks: {
    'build:done': lintJsrExports()
  },
  plugins: [
    {
      name: 'locale-copy',
      closeBundle() {
        console.log('Copying locales...')
        const localesDir = path.join(dirname, './src/locales')
        const outDir = path.join(dirname, 'lib', 'locales')
        if (fs.existsSync(localesDir)) {
          fs.rmSync(outDir, { recursive: true, force: true })
        }
        fs.mkdirSync(outDir, { recursive: true })
        for (const file of fs.readdirSync(localesDir)) {
          if (file.endsWith('.json')) {
            const srcPath = path.join(localesDir, file)
            const destPath = path.join(outDir, file)
            console.log(`Copying ${srcPath} to ${destPath}`)
            fs.copyFileSync(srcPath, destPath)
          }
        }
      }
    }
  ]
})

export default config
