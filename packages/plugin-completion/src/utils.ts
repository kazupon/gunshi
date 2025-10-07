/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

function detectRuntime(): 'bun' | 'deno' | 'node' | 'unknown' {
  // @ts-ignore -- NOTE(kazupon): ignore, because `process` will detect ts compile error on `deno check`
  if (globalThis.process !== undefined && globalThis.process.release?.name === 'node') {
    return 'node'
  }
  // @ts-ignore -- NOTE(kazupon): ignore, because development env is node.js
  if (globalThis.Deno !== undefined) {
    return 'deno'
  }
  // @ts-ignore -- NOTE(kazupon): ignore, because development env is node.js
  if (globalThis.Bun !== undefined) {
    return 'bun'
  }
  return 'unknown'
}

function quoteIfNeeded(path: string): string {
  return path.includes(' ') ? `'${path}'` : path
}

/**
 * Quote the exec command for the current runtime.
 *
 * @returns The quoted exec command string
 */
export function quoteExec(): string {
  const runtime = detectRuntime()
  switch (runtime) {
    case 'node': {
      // @ts-ignore -- NOTE(kazupon): ignore, because `process` will detect ts compile error on `deno check`
      const execPath = globalThis.process.execPath
      // @ts-ignore -- NOTE(kazupon): ignore, because `process` will detect ts compile error on `deno check`
      const processArgs = globalThis.process.argv.slice(1)
      const quotedExecPath = quoteIfNeeded(execPath)
      // eslint-disable-next-line unicorn/no-array-callback-reference -- NOTE(kazupon): callback should be testable
      const quotedProcessArgs = processArgs.map(quoteIfNeeded)
      // @ts-ignore -- NOTE(kazupon): ignore, because `process` will detect ts compile error on `deno check`
      // eslint-disable-next-line unicorn/no-array-callback-reference -- NOTE(kazupon): callback should be testable
      const quotedProcessExecArgs = globalThis.process.execArgv.map(quoteIfNeeded)
      return `${quotedExecPath} ${quotedProcessExecArgs.join(' ')} ${quotedProcessArgs[0]}`
    }
    case 'deno': {
      throw new Error('deno not implemented yet, welcome contributions :)')
    }
    case 'bun': {
      throw new Error('bun not implemented yet, welcome contributions :)')
    }
    default: {
      throw new Error('Unsupported your javascript runtime for completion script generation.')
    }
  }
}
