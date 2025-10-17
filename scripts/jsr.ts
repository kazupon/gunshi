import fs from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'

const args = parseArgs({
  strict: false,
  options: {
    package: {
      type: 'string',
      short: 'p',
      default: 'gunshi',
      description: 'The package name'
    },
    tag: {
      type: 'string',
      short: 't',
      default: 'latest',
      description: 'The tag to publish the package with'
    }
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): This is a utility script and we can use `any` here.
function updatePkgJson(pkg: string, json: Record<string, any>): Record<string, any> {
  const version: string = json.version
  if (!version) {
    throw new Error(`Package ${pkg} does not have a version defined in package.json`)
  }

  json.dependencies = json.dependencies || {}

  function setVersion(dep: string) {
    json.dependencies[dep] = version
  }

  switch (pkg) {
    case 'packages/gunshi': {
      setVersion('@gunshi/plugin-global')
      setVersion('@gunshi/plugin-renderer')
      setVersion('@gunshi/plugin-i18n')
      break
    }
    case 'packages/bone':
    case 'packages/plugin':
    case 'packages/definition': {
      setVersion('gunshi')
      break
    }
    case 'packages/shared': {
      setVersion('@gunshi/resources')
      setVersion('gunshi')
      break
    }
    case 'packages/plugin-i18n':
    case 'packages/plugin-global': {
      setVersion('@gunshi/plugin')
      setVersion('@gunshi/shared')
      break
    }
    case 'packages/plugin-completion': {
      setVersion('@gunshi/plugin')
      setVersion('@gunshi/shared')
      setVersion('@gunshi/plugin-i18n')
      break
    }
    case 'packages/plugin-renderer': {
      setVersion('@gunshi/plugin')
      setVersion('@gunshi/shared')
      setVersion('@gunshi/plugin-i18n')
      break
    }
    case 'packages/plugin-dryrun': {
      setVersion('@gunshi/plugin')
      break
    }
  }

  return json
}

async function main() {
  const { package: pkg } = args.values

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): This is a utility script and we can use `any` here.
  let json: Record<string, any>
  try {
    const module = await import(`../${pkg}/package.json`, {
      with: { type: 'json' }
    })
    json = module.default || module
  } catch (error) {
    throw new Error(
      `Failed to load package.json for ${pkg}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  json = updatePkgJson(pkg as string, json)

  try {
    await fs.writeFile(
      path.resolve(import.meta.dirname, `../${pkg}/package.json`),
      JSON.stringify(json, null, 2),
      'utf8'
    )
  } catch (error) {
    throw new Error(
      `Failed to write package.json for ${pkg}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

await main()
