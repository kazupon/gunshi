/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

/**
 * JavaScript runtime name used for executable detection.
 */
export type Runtime = 'bun' | 'deno' | 'node' | 'unknown'

/**
 * Minimal process shape needed to resolve the current executable.
 */
export interface ProcessLike {
  /**
   * Runtime arguments.
   */
  argv: string[]
  /**
   * Runtime execution arguments.
   * Bun compiled executables can embed runtime arguments into this value via
   * `bun build --compile --compile-exec-argv`.
   *
   * @see https://bun.com/docs/bundler/executables#embedding-runtime-arguments
   */
  execArgv?: string[]
  /**
   * Runtime executable path.
   */
  execPath: string
  /**
   * Runtime release metadata.
   */
  release?: {
    /**
     * Runtime release name.
     */
    name?: string
  }
}

/**
 * Runtime globals used by executable detection.
 */
export interface RuntimeGlobals {
  /**
   * Bun global marker.
   */
  Bun?: unknown
  /**
   * Deno global marker.
   */
  Deno?: unknown
  /**
   * Node-compatible process global.
   */
  process?: ProcessLike
}

/**
 * The part of the Bun global that tells a compiled executable.
 */
export interface BunLike {
  /**
   * Whether the process is an executable built with `bun build --compile`. Bun has it since 1.4.0.
   *
   * @see https://bun.com/docs/compiler/executables#detecting-standalone-mode-at-runtime
   */
  isStandaloneExecutable?: boolean
}

function getRuntimeGlobals(): RuntimeGlobals {
  return globalThis as unknown as RuntimeGlobals
}

/**
 * Detect the active JavaScript runtime.
 *
 * @returns The detected runtime name
 */
function detectRuntime(): Runtime {
  return detectRuntimeFromGlobals(getRuntimeGlobals())
}

/**
 * Detect the active JavaScript runtime from globals.
 *
 * @param globals - Runtime globals to inspect
 * @returns The detected runtime name
 */
export function detectRuntimeFromGlobals(globals: RuntimeGlobals): Runtime {
  // Bun and Deno expose Node-compatible globals, so runtime-specific markers
  // must be checked before the Node `process.release` fallback.
  if (globals.Bun !== undefined) {
    return 'bun'
  }
  if (globals.Deno !== undefined) {
    return 'deno'
  }
  if (globals.process !== undefined && globals.process.release?.name === 'node') {
    return 'node'
  }
  return 'unknown'
}

/**
 * Quote a shell command part when needed.
 *
 * This protects the command part when the generated completion script later
 * evaluates the assembled command string. Callers that embed the quoted result
 * into another shell string still need to escape that outer string.
 *
 * @param value - The command part to quote
 * @returns The shell-safe command part
 */
export function shellQuote(value: string): string {
  if (value.length === 0) {
    return "''"
  }
  if (/^[\w%+,./:=@-]+$/.test(value)) {
    return value
  }
  return `'${value.replaceAll(`'`, `'\\''`)}'`
}

function escapeDoubleQuotedShellString(value: string): string {
  // @bomb.sh/tab currently embeds the executable command in a double-quoted
  // `requestComp="..."` assignment before calling `eval`. `shellQuote` protects
  // token boundaries for the eval step, but `$`, backticks, `"`, and `\` would
  // still be interpreted while the generated script builds `requestComp`.
  // https://github.com/bombshell-dev/tab/blob/v0.0.15/src/zsh.ts#L62-L67
  // https://github.com/bombshell-dev/tab/blob/v0.0.15/src/bash.ts#L45-L53
  // https://github.com/bombshell-dev/tab/blob/v0.0.15/src/fish.ts#L41-L44
  return value.replaceAll(/[$`"\\]/g, '\\$&')
}

/**
 * Check if the entry is a Bun virtual entry.
 *
 * @param entry - The entry to check
 * @returns Whether the entry is a Bun virtual entry
 *
 * Bun compiled executables surface internal virtual paths in `process.argv`
 * instead of the original source entry. These markers are private to Bun, so
 * they only tell a compiled executable on a Bun older than 1.4, which has no
 * `Bun.isStandaloneExecutable`.
 *
 * @see https://github.com/oven-sh/bun/blob/main/src/standalone_graph/StandaloneModuleGraph.rs#L44-L70
 * @see https://github.com/oven-sh/bun/blob/main/test/regression/issue/22157.test.ts#L47-L55
 */
function isBunVirtualEntry(entry?: string): boolean {
  return (
    entry?.startsWith('/$bunfs/') === true ||
    entry?.startsWith('B:\\~BUN\\') === true ||
    entry?.startsWith('B:/~BUN/') === true
  )
}

/**
 * Resolve executable command parts for Node.js source execution.
 *
 * @param process - Node-compatible process global
 * @returns Executable command parts
 */
export function resolveNodeExecParts(process: ProcessLike): string[] {
  const entry = process.argv[1]
  return [process.execPath, ...(process.execArgv ?? []), ...(entry ? [entry] : [])]
}

/**
 * Resolve executable command parts for Bun source and compiled execution.
 *
 * @param process - Bun process global
 * @param bun - Bun global
 * @returns Executable command parts
 */
export function resolveBunExecParts(process: ProcessLike, bun?: BunLike): string[] {
  const entry = process.argv[1]

  /**
   * NOTE(kazupon): a compiled executable is told by `Bun.isStandaloneExecutable`, and by its virtual
   * entry on a Bun older than 1.4, which does not have it. The name of `process.execPath` does not
   * tell: the Bun launcher can have another name, such as the `bun.native` of Vite+, and a compiled
   * executable can be named `bun`. The completion script re-enters a compiled executable, whose
   * entry is inside it.
   */
  if (bun?.isStandaloneExecutable ?? isBunVirtualEntry(entry)) {
    return [process.execPath]
  }

  // Bun source execution follows the runtime argv shape where the launcher is
  // first and the script entry is second, so replay the launcher, Bun runtime
  // args, and the source entry.
  // https://bun.com/guides/process/argv
  return [process.execPath, ...(process.execArgv ?? []), ...(entry ? [entry] : [])]
}

/**
 * Join executable command parts into a shell-safe command string.
 *
 * @param parts - Executable command parts
 * @returns The executable command string
 */
export function joinExecParts(parts: string[]): string {
  return escapeDoubleQuotedShellString(parts.map(shellQuote).join(' '))
}

/**
 * Quote the exec command for the current runtime.
 *
 * @returns The quoted exec command string
 */
export function quoteExec(): string {
  const globals = getRuntimeGlobals()
  const runtime = detectRuntime()

  switch (runtime) {
    case 'node': {
      return joinExecParts(resolveNodeExecParts(globals.process!))
    }
    case 'deno': {
      throw new Error('Deno runtime is not supported for completion script generation.')
    }
    case 'bun': {
      return joinExecParts(resolveBunExecParts(globals.process!, globals.Bun as BunLike))
    }
    default: {
      throw new Error('Unsupported JavaScript runtime for completion script generation.')
    }
  }
}
