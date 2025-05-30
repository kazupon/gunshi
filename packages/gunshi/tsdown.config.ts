import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'tsdown'

const dirname = import.meta.dirname

function getDistributionableLocaleFiles() {
  const localesDir = path.join(dirname, './src/locales')
  const outDir = path.join(dirname, 'lib', 'locales')
  return fs.readdirSync(localesDir).reduce(
    (acc, file) => {
      if (file.endsWith('.json')) {
        acc.push({
          from: path.join(localesDir, file),
          to: path.join(outDir, file)
        })
      }
      return acc
    },
    [] as { from: string; to: string }[]
  )
}

const config: ReturnType<typeof defineConfig> = defineConfig({
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
  copy: [...getDistributionableLocaleFiles()]
})

export default config
