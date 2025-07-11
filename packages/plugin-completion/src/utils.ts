/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

// NOTE(kazupon): comment out, because it is not used yet.
// import { CLI_OPTIONS_DEFAULT, createCommandContext as _createCommandContext } from '@gunshi/plugin'
//
// import type { Args, Command, CommandContext, LazyCommand } from '@gunshi/plugin'
//
// async function createCommandContext(cmd: Command | LazyCommand): Promise<CommandContext> {
//   return await _createCommandContext({
//     args: cmd.args || (Object.create(null) as Args),
//     values: Object.create(null),
//     positionals: [],
//     rest: [],
//     argv: [],
//     tokens: [],
//     omitted: false,
//     callMode: cmd.entry ? 'entry' : 'subCommand',
//     command: cmd,
//     extensions: Object.create(null),
//     cliOptions: CLI_OPTIONS_DEFAULT
//   })
// }

function detectRuntime(): 'bun' | 'deno' | 'node' | 'unknown' {
  // @ts-ignore -- NOTE: ignore, because `process` will detect ts compile error on `deno check`
  if (globalThis.process !== undefined && globalThis.process.release?.name === 'node') {
    return 'node'
  }
  // @ts-ignore -- NOTE: ignore, because development env is node.js
  if (globalThis.Deno !== undefined) {
    return 'deno'
  }
  // @ts-ignore -- NOTE: ignore, because development env is node.js
  if (globalThis.Bun !== undefined) {
    return 'bun'
  }
  return 'unknown'
}

function quoteIfNeeded(path: string): string {
  return path.includes(' ') ? `'${path}'` : path
}

export function quoteExec(): string {
  const runtime = detectRuntime()
  switch (runtime) {
    case 'node': {
      // @ts-ignore -- NOTE: ignore, because `process` will detect ts compile error on `deno check`
      const execPath = globalThis.process.execPath
      // @ts-ignore -- NOTE: ignore, because `process` will detect ts compile error on `deno check`
      const processArgs = globalThis.process.argv.slice(1)
      const quotedExecPath = quoteIfNeeded(execPath)
      // eslint-disable-next-line unicorn/no-array-callback-reference
      const quotedProcessArgs = processArgs.map(quoteIfNeeded)
      // @ts-ignore -- NOTE: ignore, because `process` will detect ts compile error on `deno check`
      // eslint-disable-next-line unicorn/no-array-callback-reference
      const quotedProcessExecArgs = globalThis.process.execArgv.map(quoteIfNeeded)
      return `${quotedExecPath} ${quotedProcessExecArgs.join(' ')} ${quotedProcessArgs[0]}`
    }
    case 'deno': {
      throw new Error('deno not implemented yet, welcome contributions :)')
    }
    case 'bun': {
      throw new Error('deno not implemented yet, welcome contributions :)')
    }
    default: {
      throw new Error('Unsupported your javascript runtime for completion script generation.')
    }
  }
}
