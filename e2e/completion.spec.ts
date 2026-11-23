import path from 'node:path'
import { expect, test } from 'vite-plus/test'
import { runCommand } from '../scripts/utils.ts'

const ROOT = path.resolve(import.meta.dirname, '..')

// the unit tests of `@gunshi/plugin-completion` run the examples in the process of the test, so
// these check that a real process prints the candidates to stdout, and exits with `0`
function complete(example: string, args: string, env?: NodeJS.ProcessEnv): Promise<string> {
  const file = path.join('packages/plugin-completion/examples', `${example}.node.ts`)
  return runCommand(`pnpm exec tsx ${file} complete -- ${args}`, { cwd: ROOT, env })
}

test('completes the options of a sub-command', async () => {
  const output = await complete('basic', 'dev --')

  expect(output.split('\n')).toEqual([
    '--help\tDisplay this help message',
    '--version\tDisplay this version',
    '--host\tSpecify hostname',
    '--port\tSpecify port',
    ':4',
    ''
  ])
})

test('completes the value of an option with its handler', async () => {
  const output = await complete('basic', 'dev --port=')

  expect(output.split('\n')).toEqual([
    '3000\tDevelopment server port',
    '8080\tAlternative port',
    ':4',
    ''
  ])
})

test('completes with the descriptions of the locale', async () => {
  const output = await complete('i18n', 'dev --', { MY_LOCALE: 'ja-JP' })

  expect(output.split('\n')).toEqual([
    '--help\tDisplay this help message',
    '--version\tDisplay this version',
    '--host\tホスト名を指定します',
    '--port\tポート番号を指定します',
    ':4',
    ''
  ])
})
