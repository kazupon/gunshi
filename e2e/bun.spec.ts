import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { expect, test } from 'vitest'
import { runCommand } from '../scripts/utils.ts'

const ROOT = path.resolve(import.meta.dirname, '..')

// runCommand uses node:child_process exec, and E2E CI runs on ubuntu-latest,
// so these command strings intentionally use POSIX shell quoting.
function shellQuote(value: string): string {
  return `'${value.replaceAll(`'`, `'\\''`)}'`
}

test('bun', async () => {
  // install dependencies
  await runCommand('bun install', {
    cwd: path.resolve(import.meta.dirname, '../playground/bun')
  })
  const output = await runCommand('bun cli.ts', {
    cwd: path.resolve(import.meta.dirname, '../playground/bun')
  })
  expect(output).include(`Hello, Gunshi with Bun!`)
})

test('bun source completion', async () => {
  const fixture = path.resolve(ROOT, 'packages/plugin-completion/examples/basic.node.ts')
  const command = `bun ${shellQuote(fixture)}`
  const script = await runCommand(`${command} complete zsh`, {
    cwd: ROOT
  })
  expect(script).include('bun')

  const output = await runCommand(`${command} complete -- --config vite.config`, {
    cwd: ROOT
  })
  expect(output).include('vite.config.ts')
})

test('bun single binary completion', async () => {
  const fixture = path.resolve(ROOT, 'packages/plugin-completion/examples/basic.node.ts')
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'gunshi-completion-bun-'))
  const outfile = path.join(tmpDir, 'gunshi-completion-bun')

  try {
    await runCommand(
      `bun build --compile ${shellQuote(fixture)} --outfile ${shellQuote(outfile)}`,
      {
        cwd: ROOT,
        timeout: 60_000
      }
    )

    const script = await runCommand(`${shellQuote(outfile)} complete zsh`, {
      cwd: ROOT
    })
    expect(script).include(outfile)

    const output = await runCommand(`${shellQuote(outfile)} complete -- --config vite.config`, {
      cwd: ROOT
    })
    expect(output).include('vite.config.ts')
  } finally {
    await rm(tmpDir, { force: true, recursive: true })
  }
})
