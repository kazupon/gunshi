/**
 * The entry for gunshi context.
 * This module is exported for the purpose of testing the command.
 *
 * @example
 * ```js
 * import { createCommandContext } from 'gunshi/context'
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ANONYMOUS_COMMAND_NAME, COMMAND_OPTIONS_DEFAULT, NOOP } from './constants.ts'
import { create, deepFreeze, isLazyCommand, log } from './utils.ts'

import type {
  Args,
  ArgSchema,
  ArgToken,
  ArgValues,
  CliOptions,
  Command,
  CommandCallMode,
  CommandContext,
  CommandContextCore,
  CommandContextExtension,
  CommandEnvironment,
  DefaultGunshiParams,
  ExtendContext,
  ExtractArgs,
  GunshiParams,
  GunshiParamsConstraint,
  LazyCommand
} from './types.ts'

/**
 * Extract extension return types from extensions record
 * @internal
 */
export type ExtractExtensions<E extends Record<string, CommandContextExtension>> = {
  [K in keyof E]: E[K] extends CommandContextExtension<infer T> ? T : never
}

/**
 * Parameters of {@link createCommandContext}
 */
interface CommandContextParams<
  G extends GunshiParams | { extensions: ExtendContext },
  V extends ArgValues<ExtractArgs<G>>,
  C extends Command<G> | LazyCommand<G> = Command<G>,
  E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension>
> {
  /**
   * An arguments of target command
   */
  args: ExtractArgs<G>
  /**
   * A values of target command
   */
  values: V
  /**
   * A positionals arguments, which passed to the target command
   */
  positionals: string[]
  /**
   * A rest arguments, which passed to the target command
   */
  rest: string[]
  /**
   * Original command line arguments
   */
  argv: string[]
  /**
   * Argument tokens that are parsed by the `parseArgs` function
   */
  tokens: ArgToken[]
  /**
   * Whether the command is omitted
   */
  omitted: boolean
  /**
   * Command call mode.
   */
  callMode: CommandCallMode
  /**
   * A target command
   */
  command: C
  /**
   * Plugin extensions to apply as the command context extension.
   */
  extensions?: E
  /**
   * A command options, which is spicialized from `cli` function
   */
  cliOptions: CliOptions<G>
  /**
   * Validation error from argument parsing.
   */
  validationError?: AggregateError
}

/**
 * Create a {@link CommandContext | command context}
 * @param param A {@link CommandContextParams | parameters} to create a {@link CommandContext | command context}
 * @returns A {@link CommandContext | command context}, which is readonly
 */
export async function createCommandContext<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  V extends ArgValues<ExtractArgs<G>> = ArgValues<ExtractArgs<G>>,
  C extends Command<G> | LazyCommand<G> = Command<G>,
  E extends Record<string, CommandContextExtension> = {}
>({
  args,
  values,
  positionals,
  rest,
  argv,
  tokens,
  command,
  extensions = {} as E,
  cliOptions,
  callMode = 'entry',
  omitted = false,
  validationError
}: CommandContextParams<G, V, C, E>): Promise<
  {} extends ExtractExtensions<E>
    ? Readonly<CommandContext<G>>
    : Readonly<
        CommandContext<GunshiParams<{ args: ExtractArgs<G>; extensions: ExtractExtensions<E> }>>
      >
> {
  /**
   * normailize the options schema and values, to avoid prototype pollution
   */

  const _args = Object.entries(args as Args).reduce((acc, [key, value]) => {
    acc[key] = Object.assign(create<ArgSchema>(), value)
    return acc
  }, create<Args>())

  /**
   * setup the environment
   */

  const env = Object.assign(create<CommandEnvironment<G>>(), COMMAND_OPTIONS_DEFAULT, cliOptions)

  /**
   * create the command context
   */

  const core = Object.assign(create<CommandContext<G>>(), {
    name: getCommandName(command as Command),
    description: command.description,
    omitted,
    callMode,
    env,
    args: _args,
    values,
    positionals,
    rest,
    _: argv,
    tokens,
    toKebab: command.toKebab,
    log: cliOptions.usageSilent ? NOOP : log,
    validationError
  })

  /**
   * extend the command context with extensions
   */

  if (Object.keys(extensions).length > 0) {
    const ext = create<Record<string, ReturnType<CommandContextExtension['factory']>>>(null)
    Object.defineProperty(core, 'extensions', {
      value: ext,
      writable: false,
      enumerable: true,
      configurable: true
    })
    for (const [key, extension] of Object.entries(extensions)) {
      ext[key] = await extension.factory(core as CommandContextCore, command as Command)
      if (extension.onFactory) {
        await extension.onFactory(core as CommandContext, command as Command)
      }
    }
  }
  const ctx = deepFreeze(core, ['extensions'])

  return ctx as {} extends ExtractExtensions<E>
    ? Readonly<CommandContext<G>>
    : Readonly<
        CommandContext<GunshiParams<{ args: ExtractArgs<G>; extensions: ExtractExtensions<E> }>>
      >
}

function getCommandName<G extends GunshiParams>(cmd: Command<G> | LazyCommand<G>): string {
  if (isLazyCommand<G>(cmd)) {
    return cmd.commandName || cmd.name || ANONYMOUS_COMMAND_NAME
  } else if (typeof cmd === 'object') {
    return cmd.name || ANONYMOUS_COMMAND_NAME
  } else {
    return ANONYMOUS_COMMAND_NAME
  }
}
