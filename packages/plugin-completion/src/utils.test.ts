/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { describe, expect, test } from 'vitest'
import {
  detectRuntime,
  joinExecParts,
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

describe('detectRuntime', () => {
  test('prioritizes Bun over Deno and Node-compatible process', () => {
    expect(
      detectRuntime({
        Bun: {},
        Deno: {},
        process: createProcess()
      })
    ).toBe('bun')
  })

  test('prioritizes Deno over Node-compatible process', () => {
    expect(
      detectRuntime({
        Deno: {},
        process: createProcess()
      })
    ).toBe('deno')
  })

  test('detects Node from process release name', () => {
    expect(
      detectRuntime({
        process: createProcess()
      })
    ).toBe('node')
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

  test('resolves Bun single binary on Unix', () => {
    expect(
      resolveBunExecParts(
        createProcess({
          argv: ['/tmp/my-cli'],
          execPath: '/tmp/my-cli'
        })
      )
    ).toEqual(['/tmp/my-cli'])
  })

  test('resolves Bun single binary on Windows', () => {
    expect(
      resolveBunExecParts(
        createProcess({
          argv: ['C:\\tools\\my-cli.exe'],
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
