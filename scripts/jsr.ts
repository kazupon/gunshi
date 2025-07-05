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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updatePkgJson(pkg: string, json: Record<string, any>): Record<string, any> {
  const version: string = json.version
  if (!version) {
    throw new Error(`Package ${pkg} does not have a version defined in package.json`)
  }
  // …rest of the function…
}

  json.dependencies = json.dependencies || {}
  switch (pkg) {
    case 'packages/gunshi': {
      json.dependencies['@gunshi/plugin-global'] = version
      json.dependencies['@gunshi/plugin-renderer'] = version
      json.dependencies['@gunshi/plugin-i18n'] = version
      break
    }
    case 'packages/bone':
    case 'packages/plugin':
    case 'packages/definition': {
      json.dependencies['gunshi'] = version
      break
    }
    case 'packages/shared': {
      json.dependencies['@gunshi/resources'] = version
      json.dependencies['gunshi'] = version
      break
    }
    case 'packages/plugin-i18n':
    case 'packages/plugin-global': {
      json.dependencies['@gunshi/plugin'] = version
      json.dependencies['@gunshi/shared'] = version
      break
    }
    case 'packages/plugin-renderer': {
      json.dependencies['@gunshi/plugin'] = version
      json.dependencies['@gunshi/shared'] = version
      json.dependencies['@gunshi/plugin-i18n'] = version
      break
    }
    case 'packages/plugin-dryrun':
    case 'packages/plugin-completion': {
      json.dependencies['@gunshi/plugin'] = version
      break
    }
  }

  return json
}

async function main() {
  const { package: pkg } = args.values
  let json = (await import(`../${pkg}/package.json`, {
    with: { type: 'json' }
  }).then(m => m.default || m)) as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
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
