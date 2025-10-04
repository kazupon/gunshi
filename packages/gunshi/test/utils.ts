import { vi } from 'vitest'
import { create } from '../src/utils.ts'

import type { Args } from 'args-tokens'
import type {
  Command,
  CommandContext,
  CommandContextExtension,
  CommandEnvironment,
  DefaultGunshiParams,
  ExtendContext,
  GunshiParams
} from '../src/types.ts'

type NoExt = Record<never, never>

export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> }

/**
 *
 * @param utils
 */
export function defineMockLog(utils: typeof import('../src/utils.ts')) {
  const logs: unknown[] = []
  vi.spyOn(utils, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })

  return () => logs.join(`\n`)
}

/**
 *
 * @param obj
 */
export function hasPrototype(obj: unknown): boolean {
  return Object.getPrototypeOf(obj) !== null
}

type CreateMockCommandContext<G extends GunshiParams = DefaultGunshiParams> = Partial<
  Omit<CommandContext, 'extensions'> &
    Omit<CommandEnvironment, 'name' | 'description' | 'version'> & {
      extensions?: Record<string, CommandContextExtension<G['extensions']>>
      command?: Command<G>
      version?: string | null
    }
>

/**
 *
 * @param options
 */
export async function createMockCommandContext<E extends ExtendContext = NoExt>(
  options: CreateMockCommandContext = {}
): Promise<
  CommandContext<
    GunshiParams<{
      /**
       *
       */
      args: Args /**
       *
       */
      extensions: E
    }>
  >
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): test utility function
  let ctx: any = {
    name: options.name || 'mock-command',
    description: options.description || 'Mock command',
    locale: new Intl.Locale('en-US'),
    env: {
      cwd: options.cwd,
      name: 'test-app',
      description: 'Test application',
      version: options.version == null ? undefined : options.version || '1.0.0',
      leftMargin: options.leftMargin || 2,
      middleMargin: options.middleMargin || 10,
      usageOptionType: options.usageOptionType || false,
      usageOptionValue: options.usageOptionValue || true,
      usageSilent: options.usageSilent ?? false,
      subCommands: options.subCommands ?? undefined,
      renderUsage: options.renderUsage || undefined,
      renderHeader: options.renderHeader || undefined,
      renderValidationErrors: options.renderValidationErrors || undefined
    },
    args: options.args || {},
    values: options.values || {},
    positionals: options.positionals || [],
    rest: options.rest || [],
    _: options._ || [],
    tokens: options.tokens || [],
    omitted: options.omitted || false,
    callMode: options.callMode || 'entry',
    log: options.log || vi.fn()
  }

  if (options.extensions) {
    const ext = create(null) as any // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): Test utility function
    Object.defineProperty(ctx, 'extensions', {
      value: ext,
      writable: false,
      enumerable: true,
      configurable: true
    })
    for (const [key, extension] of Object.entries(options.extensions)) {
      ext[key] = await (extension as CommandContextExtension).factory(
        ctx,
        options.command as Command
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): utilify for test codes
    ctx = Object.assign(create<any>(), ctx, { extensions: ext })
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): utilify for test codes
    ctx = Object.assign(create<any>(), ctx, { extensions: {} })
  }

  return ctx as CommandContext<
    GunshiParams<{
      /**
       *
       */
      args: Args /**
       *
       */
      extensions: E
    }>
  >
}
