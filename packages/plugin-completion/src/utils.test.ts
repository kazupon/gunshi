/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import {
  detectRuntimeFromGlobals,
  joinExecParts,
  quoteExec,
  resolveBunExecParts,
  resolveNodeExecParts,
  shellQuote
} from './utils.ts'

import type { ProcessLike } from './utils.ts'

function createProcess(overrides: Partial<ProcessLike> = {}): ProcessLike {
  return {
    argv: ['/usr/local/bin/node', './cli.ts'],
    execArgv: [],
    execPath: '/usr/local/bin/node',
    release: {
      name: 'node'
    },
    ...overrides
  }
}

describe('detectRuntimeFromGlobals', () => {
  test('prioritizes Bun over Deno and Node-compatible process', () => {
    expect(
      detectRuntimeFromGlobals({
        Bun: {},
        Deno: {},
        process: createProcess()
      })
    ).toBe('bun')
  })

  test('prioritizes Deno over Node-compatible process', () => {
    expect(
      detectRuntimeFromGlobals({
        Deno: {},
        process: createProcess()
      })
    ).toBe('deno')
  })

  test('detects Node from process release name', () => {
    expect(
      detectRuntimeFromGlobals({
        process: createProcess()
      })
    ).toBe('node')
  })
})

describe('quoteExec', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test.each([
    { isStandaloneExecutable: true, command: '/opt/bin/bun' },
    { isStandaloneExecutable: false, command: '/opt/bin/bun /opt/cli.js' }
  ])(
    'gives the Bun global to the check (isStandaloneExecutable: $isStandaloneExecutable)',
    ({ isStandaloneExecutable, command }) => {
      vi.stubGlobal('Bun', { isStandaloneExecutable })
      vi.stubGlobal('process', {
        argv: ['/opt/bin/bun', '/opt/cli.js'],
        execArgv: [],
        execPath: '/opt/bin/bun'
      })

      expect(quoteExec()).toBe(command)
    }
  )

  test('throws on Deno', () => {
    vi.stubGlobal('Deno', {})

    expect(() => quoteExec()).toThrow(
      new Error('Deno runtime is not supported for completion script generation.')
    )
  })
})

describe('resolveNodeExecParts', () => {
  test('resolves Node source execution', () => {
    expect(resolveNodeExecParts(createProcess())).toEqual(['/usr/local/bin/node', './cli.ts'])
  })
})

describe('resolveBunExecParts', () => {
  test('resolves Bun source execution', () => {
    expect(
      resolveBunExecParts(
        createProcess({
          argv: ['/usr/local/bin/bun', './src/cli.ts'],
          execPath: '/usr/local/bin/bun'
        })
      )
    ).toEqual(['/usr/local/bin/bun', './src/cli.ts'])
  })

  test('resolves Bun source execution with execArgv', () => {
    expect(
      resolveBunExecParts(
        createProcess({
          argv: ['/usr/local/bin/bun', './src/cli.ts'],
          execArgv: ['--smol'],
          execPath: '/usr/local/bin/bun'
        })
      )
    ).toEqual(['/usr/local/bin/bun', '--smol', './src/cli.ts'])
  })

  test.each(['bun.native', 'bun-canary', 'runtime'])(
    'resolves Bun source execution by a launcher named %s',
    name => {
      const execPath = `/opt/bun/bin/${name}`

      expect(
        resolveBunExecParts(createProcess({ argv: [execPath, './src/cli.ts'], execPath }))
      ).toEqual([execPath, './src/cli.ts'])
    }
  )

  test('takes a process with `Bun.isStandaloneExecutable` for a compiled executable', () => {
    expect(
      resolveBunExecParts(
        createProcess({ argv: ['bun', '/another/virtual/root/my-cli'], execPath: '/tmp/my-cli' }),
        { isStandaloneExecutable: true }
      )
    ).toEqual(['/tmp/my-cli'])
  })

  test('trusts `Bun.isStandaloneExecutable` over the shape of the entry', () => {
    expect(
      resolveBunExecParts(
        createProcess({
          argv: ['/usr/local/bin/bun', '/$bunfs/root/main.js'],
          execPath: '/usr/local/bin/bun'
        }),
        { isStandaloneExecutable: false }
      )
    ).toEqual(['/usr/local/bin/bun', '/$bunfs/root/main.js'])
  })

  test('resolves Bun single binary on Unix', () => {
    expect(
      resolveBunExecParts(
        createProcess({
          argv: ['bun', '/$bunfs/root/my-cli'],
          execPath: '/tmp/my-cli'
        })
      )
    ).toEqual(['/tmp/my-cli'])
  })

  test('resolves Bun single binary on Windows', () => {
    expect(
      resolveBunExecParts(
        createProcess({
          argv: ['bun', 'B:/~BUN/root/my-cli.exe'],
          execPath: 'C:\\tools\\my-cli.exe'
        })
      )
    ).toEqual(['C:\\tools\\my-cli.exe'])
  })

  test('resolves Bun Unix virtual compiled entry', () => {
    expect(
      resolveBunExecParts(
        createProcess({
          argv: ['/usr/local/bin/bun', '/$bunfs/root/main.js'],
          execPath: '/usr/local/bin/bun'
        })
      )
    ).toEqual(['/usr/local/bin/bun'])
  })

  test('resolves Bun Windows virtual compiled entry', () => {
    expect(
      resolveBunExecParts(
        createProcess({
          argv: ['C:\\tools\\bun.exe', 'B:\\~BUN\\root.js'],
          execPath: 'C:\\tools\\bun.exe'
        })
      )
    ).toEqual(['C:\\tools\\bun.exe'])
  })
})

describe('shellQuote', () => {
  test('escapes spaces and single quotes', () => {
    expect(shellQuote("/tmp/my cli's/bin")).toBe(`'/tmp/my cli'\\''s/bin'`)
  })

  test('joins quoted exec parts without extra spaces', () => {
    expect(joinExecParts(['/tmp/my cli/bin', "--flag=it's", './cli.ts'])).toBe(
      String.raw`'/tmp/my cli/bin' '--flag=it'\\''s' ./cli.ts`
    )
  })

  test('escapes metacharacters for generated double-quoted shell assignment', () => {
    expect(
      joinExecParts(['/tmp/$(touch pwn)/my cli', '--loader=`touch pwn`', './"quoted".ts'])
    ).toBe("'/tmp/\\$(touch pwn)/my cli' '--loader=\\`touch pwn\\`' './\\\"quoted\\\".ts'")
  })

  test('preserves backslashes through generated double-quoted shell assignment', () => {
    expect(joinExecParts(['C:\\tools\\my cli.exe'])).toBe("'C:\\\\tools\\\\my cli.exe'")
  })
})
