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

import {
  ANONYMOUS_COMMAND_NAME,
  BUILT_IN_PREFIX,
  COMMAND_OPTIONS_DEFAULT,
  DEFAULT_LOCALE,
  NOOP
} from './constants.ts'
import DefaultResource from './locales/en-US.json' with { type: 'json' }
import { createTranslationAdapter } from './translation.ts'
import {
  create,
  deepFreeze,
  isLazyCommand,
  log,
  mapResourceWithBuiltinKey,
  resolveArgKey,
  resolveExamples,
  resolveLazyCommand
} from './utils.ts'

import type { Args, ArgSchema, ArgToken, ArgValues } from 'args-tokens'
import type {
  CliOptions,
  Command,
  CommandBuiltinKeys,
  CommandCallMode,
  CommandContext,
  CommandContextCore,
  CommandContextExtension,
  CommandEnvironment,
  CommandResource,
  ExtendedCommand,
  LazyCommand
} from './types.ts'

const BUILT_IN_PREFIX_CODE = BUILT_IN_PREFIX.codePointAt(0)

/**
 * Parameters of {@link createCommandContext}
 */
interface CommandContextParams<A extends Args, V> {
  /**
   * An arguments of target command
   */
  args: A
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
  command: Command<A> | LazyCommand<A> | ExtendedCommand<A, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  /**
   * A command options, which is spicialized from `cli` function
   */
  cliOptions: CliOptions<A>
}

/**
 * Create a {@link CommandContext | command context}
 * @param param A {@link CommandContextParams | parameters} to create a {@link CommandContext | command context}
 * @returns A {@link CommandContext | command context}, which is readonly
 */
export async function createCommandContext<
  A extends Args = Args,
  V extends ArgValues<A> = ArgValues<A>
>({
  args,
  values,
  positionals,
  rest,
  argv,
  tokens,
  command,
  cliOptions,
  callMode = 'entry',
  omitted = false
}: CommandContextParams<A, V>): Promise<Readonly<CommandContext<A, V>>> {
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

  const env = Object.assign(create<CommandEnvironment<A>>(), COMMAND_OPTIONS_DEFAULT, cliOptions)

  const locale = resolveLocale(cliOptions.locale)
  const localeStr = locale.toString() // NOTE: `locale` is a `Intl.Locale` object, avoid overhead with `toString` calling for every time

  const translationAdapterFactory = cliOptions.translationAdapterFactory || createTranslationAdapter
  const adapter = translationAdapterFactory({
    locale: localeStr,
    fallbackLocale: DEFAULT_LOCALE
  })

  // store built-in locale resources in the environment
  const localeResources: Map<string, Record<string, string>> = new Map()

  let builtInLoadedResources: Record<string, string> | undefined

  /**
   * load the built-in locale resources
   */

  localeResources.set(DEFAULT_LOCALE, mapResourceWithBuiltinKey(DefaultResource))
  if (DEFAULT_LOCALE !== localeStr) {
    try {
      builtInLoadedResources = (
        (await import(`./locales/${localeStr}.json`, {
          with: { type: 'json' }
        })) as { default: Record<string, string> }
      ).default
      localeResources.set(localeStr, mapResourceWithBuiltinKey(builtInLoadedResources))
    } catch {}
  }

  /**
   * define the translation function, which is used to {@link CommandContext.translate}.
   *
   */

  function translate<T extends string = CommandBuiltinKeys, K = CommandBuiltinKeys | keyof A | T>(
    key: K,
    values: Record<string, unknown> = create<Record<string, unknown>>()
  ): string {
    const strKey = key as string
    if (strKey.codePointAt(0) === BUILT_IN_PREFIX_CODE) {
      // NOTE:
      // if the key is one of the `COMMAND_BUILTIN_RESOURCE_KEYS` and the key is not found in the locale resources,
      // then return the key itself.
      const resource = localeResources.get(localeStr) || localeResources.get(DEFAULT_LOCALE)!
      return resource[strKey as CommandBuiltinKeys] || strKey
    } else {
      // NOTE:
      // for otherwise, if the key is not found in the command resources, then return an empty string.
      // because should not render the key in usage.
      return adapter.translate(locale.toString(), strKey, values) || ''
    }
  }

  /**
   * load the sub commands
   */

  let cachedCommands: Command<A>[] | undefined
  async function loadCommands(): Promise<Command<A>[]> {
    if (cachedCommands) {
      return cachedCommands
    }

    const subCommands = [...(cliOptions.subCommands || [])] as [string, Command<A>][]
    return (cachedCommands = await Promise.all(
      subCommands.map(async ([name, cmd]) => await resolveLazyCommand(cmd, name))
    ))
  }

  /**
   * create the command context
   */

  const core = Object.assign(create<CommandContext<A, V>>(), {
    name: getCommandName(command),
    description: command.description,
    omitted,
    callMode,
    locale,
    env,
    args: _args,
    values,
    positionals,
    rest,
    _: argv,
    tokens,
    toKebab: command.toKebab,
    log: cliOptions.usageSilent ? NOOP : log,
    loadCommands,
    translate
  })

  /**
   * extend the command context with extensions
   */

  // TODO(kazupon): remove `any` type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ctx: any

  // if command requires extensions
  if ('_extensions' in command && command._extensions) {
    const ext = {} as any // eslint-disable-line @typescript-eslint/no-explicit-any

    // apply each extension
    for (const [key, extension] of Object.entries(command._extensions)) {
      ext[key] = (extension as CommandContextExtension).factory(core as CommandContextCore<A, V>)
    }

    // create extended context with extensions
    // TODO(kazupon): remove `any` type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extendedCtx = Object.assign(create<any>(), core, {
      ext: Object.freeze(ext)
    })

    ctx = deepFreeze(extendedCtx)
  } else {
    // without extensions (backward compatibility)
    ctx = deepFreeze(core)
  }

  /**
   * load the command resources
   */

  // extract option descriptions from command options
  const loadedOptionsResources = Object.entries(args).map(([key, arg]) => {
    // get description from option if available
    const description = arg.description || ''
    return [key, description] as [string, string]
  })

  const defaultCommandResource = loadedOptionsResources.reduce((res, [key, value]) => {
    res[resolveArgKey(key)] = value
    return res
  }, create<Record<string, string>>())
  defaultCommandResource.description = command.description || ''
  defaultCommandResource.examples = await resolveExamples(ctx, command.examples)
  adapter.setResource(DEFAULT_LOCALE, defaultCommandResource)

  const originalResource = await loadCommandResource<A, V>(ctx, command)
  if (originalResource) {
    const resource = Object.assign(
      create<Record<string, string>>(),
      originalResource as Record<string, string>,
      {
        examples: await resolveExamples(ctx, originalResource.examples)
      } as Record<string, string>
    )
    if (builtInLoadedResources) {
      resource.help = builtInLoadedResources.help
      resource.version = builtInLoadedResources.version
    }
    adapter.setResource(localeStr, resource)
  }

  return ctx
}

function getCommandName<A extends Args>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cmd: Command<A> | LazyCommand<A> | ExtendedCommand<A, any>
): string {
  if (isLazyCommand<A>(cmd)) {
    return cmd.commandName || cmd.name || ANONYMOUS_COMMAND_NAME
  } else if (typeof cmd === 'object') {
    return cmd.name || ANONYMOUS_COMMAND_NAME
  } else {
    return ANONYMOUS_COMMAND_NAME
  }
}

function resolveLocale(locale: string | Intl.Locale | undefined): Intl.Locale {
  return locale instanceof Intl.Locale
    ? locale
    : typeof locale === 'string'
      ? new Intl.Locale(locale)
      : new Intl.Locale(DEFAULT_LOCALE)
}

async function loadCommandResource<A extends Args, V extends ArgValues<A>>(
  ctx: CommandContext<A, V>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  command: Command<A> | ExtendedCommand<A, any> | LazyCommand<A>
): Promise<CommandResource<A> | undefined> {
  let resource: CommandResource<A> | undefined
  try {
    // TODO: should check the resource which is a dictionary object
    resource = await command.resource?.(ctx)
  } catch {}
  return resource
}
