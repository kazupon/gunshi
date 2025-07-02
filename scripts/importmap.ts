import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

async function main() {
  console.log('generate import map ...')

  const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json')
  if (!configPath) {
    throw new Error('not found tsconfig.json')
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
  if (configFile.error) {
    throw new Error(`Error reading tsconfig.json: ${configFile.error.messageText}`)
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath!)
  )

  if (parsedConfig.errors.length > 0) {
    throw new Error(
      `Error parsing tsconfig.json: ${parsedConfig.errors.map(e => e.messageText).join(', ')}`
    )
  }

  const paths = parsedConfig.options.paths || {}
  const importMap: Record<string, string> = {}
  for (const [key, value] of Object.entries(paths)) {
    if (value.length === 0) {
      continue
    }
    importMap[key] = value[0]
  }

  await fs.writeFile(
    path.join(import.meta.dirname, '../importmap.json'),
    JSON.stringify(
      {
        imports: importMap
      },
      null,
      2
    )
  )

  console.log('done!')
}

await main()
