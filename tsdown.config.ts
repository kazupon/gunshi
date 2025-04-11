import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'tsdown'

const dirname = import.meta.dirname

const config: ReturnType<typeof defineConfig> = defineConfig({
  entry: ['./src/index.ts', './src/definition.ts', './src/renderer.ts', './src/generator.ts'],
  outDir: 'lib',
  publint: true,
  dts: true,
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
