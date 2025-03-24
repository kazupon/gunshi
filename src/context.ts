import DefaultResource from '../locales/en-US.json' with { type: 'json' }
import { BUILT_IN_PREFIX, COMMAND_OPTIONS_DEFAULT, DEFAULT_LOCALE, NOOP } from './constants.ts'
import { createTranslationAdapter } from './translation.ts'
import { create, deepFreeze, log, mapResourceWithBuiltinKey, resolveLazyCommand } from './utils.ts'

import type { ArgOptions, ArgOptionSchema, ArgValues } from 'args-tokens'
import type {
  Command,
  CommandBuiltinKeys,
  CommandContext,
  CommandEnvironment,
  CommandOptions,
  CommandResource
} from './types.ts'

const BUILT_IN_PREFIX_CODE = BUILT_IN_PREFIX.codePointAt(0)

/**
 * Parameters of {@link createCommandContext}
 */
interface CommandContextParams<Options extends ArgOptions, Values> {
  /**
   * An options of target command
   */
  options: Options
  /**
   * A values of target command
   */
  values: Values
  /**
   * A positionals arguments, which passed to the target command
   */
  positionals: string[]
  /**
   * Whether the command is omitted
   */
  omitted: boolean
  /**
   * A target {@link Command | command}
   */
  command: Command<Options>
  /**
   * A command options, which is spicialized from `cli` function
   */
  commandOptions: CommandOptions<Options>
}

/**
 * Create a {@link CommandContext | command context}
 * @param param A {@link CommandContextParams | parameters} to create a {@link CommandContext | command context}
 * @returns A {@link CommandContext | command context}, which is readonly
 */
export async function createCommandContext<
  Options extends ArgOptions = ArgOptions,
  Values = ArgValues<Options>
>({
  options,
  values,
  positionals,
  command,
  commandOptions,
  omitted = false
}: CommandContextParams<Options, Values>): Promise<Readonly<CommandContext<Options, Values>>> {
  /**
   * tweak the options and values
   */

  const _options = Object.entries(options as ArgOptions).reduce((acc, [key, value]) => {
    acc[key] = Object.assign(create<ArgOptionSchema>(), value)
    return acc
  }, create<ArgOptions>())
  const _values = Object.assign(create<ArgValues<Options>>(), values)

  /**
   * normalize the usage
   */

  const usage = Object.assign(create<Options>(), command.usage)
  const { help, version } = DefaultResource as unknown as ArgOptions
  usage.options = Object.assign(create<Options>(), usage.options, { help, version })

  /**
   * setup the environment
   */

  const env = Object.assign(
    create<CommandEnvironment<Options>>(),
    COMMAND_OPTIONS_DEFAULT,
    commandOptions
  )

  const locale = resolveLocale(commandOptions.locale)
  const translationAdapterFactory =
    commandOptions.translationAdapterFactory || createTranslationAdapter
  const adapter = translationAdapterFactory({
    locale: locale.toString(),
    fallbackLocale: DEFAULT_LOCALE
  })

  // store built-in locale resources in the environment
  const localeResources: Map<string, Record<string, string>> = new Map()

  let builtInLoadedResources: Record<string, string> | undefined

  /**
   * load the built-in locale resources
   */

  localeResources.set(DEFAULT_LOCALE, mapResourceWithBuiltinKey(DefaultResource))
  if (DEFAULT_LOCALE !== locale.toString()) {
    try {
      builtInLoadedResources = (await import(`../locales/${locale.toString()}.json`, {
        with: { type: 'json' }
      })) as Record<string, string>
      localeResources.set(locale.toString(), mapResourceWithBuiltinKey(builtInLoadedResources))
    } catch {}
  }

  /**
   * define the translation function, which is used to {@link CommandContext.translate}.
   *
   */

  function translate<
    T extends string = CommandBuiltinKeys,
    Key = CommandBuiltinKeys | keyof Options | T
  >(key: Key, values: Record<string, unknown> = create<Record<string, unknown>>()): string {
    const strKey = key as string
    if (strKey.codePointAt(0) === BUILT_IN_PREFIX_CODE) {
      // NOTE:
      // if the key is one of the `COMMAND_BUILTIN_RESOURCE_KEYS` and the key is not found in the locale resources,
      // then return the key itself.
      const resource =
        localeResources.get(locale.toString()) || localeResources.get(DEFAULT_LOCALE)!
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

  let cachedCommands: Command<Options>[] | undefined
  async function loadCommands(): Promise<Command<Options>[]> {
    if (cachedCommands) {
      return cachedCommands
    }

    const subCommands = [...(env.subCommands || [])] as [string, Command<Options>][]
    return (cachedCommands = await Promise.all(
      subCommands.map(async ([name, cmd]) => await resolveLazyCommand(cmd, name))
    ))
  }

  /**
   * create the context
   */

  const ctx = deepFreeze(
    Object.assign(create<CommandContext<Options, Values>>(), {
      name: command.name,
      description: command.description,
      omitted,
      locale,
      env,
      options: _options,
      values: _values,
      positionals,
      usage,
      log: commandOptions.usageSilent ? NOOP : log,
      loadCommands,
      translate
    })
  )

  /**
   * load the command resources
   */

  const loadedOptionsResources = Object.entries(usage.options || create<Options>()).map(
    ([key, _]) => {
      const option = usage.options![key]
      return [key, option] as [string, string]
    }
  )

  const defaultCommandResource = loadedOptionsResources.reduce((res, [key, value]) => {
    res[key] = value
    return res
  }, create<Record<string, string>>())
  defaultCommandResource.description = command.description || ''
  defaultCommandResource.examples = usage.examples || ''
  adapter.setResource(DEFAULT_LOCALE, defaultCommandResource)

  const originalResource = await loadCommandResource(ctx, command)
  if (originalResource) {
    const resource = Object.assign(
      create<Record<string, string>>(),
      {
        description: originalResource.description,
        examples: originalResource.examples
      } as Record<string, string>,
      originalResource as Record<string, string>
    )
    if (builtInLoadedResources) {
      resource.help = builtInLoadedResources.help
      resource.version = builtInLoadedResources.version
    }
    adapter.setResource(locale.toString(), resource)
  }

  return ctx
}

function resolveLocale(locale: string | Intl.Locale | undefined): Intl.Locale {
  return locale instanceof Intl.Locale
    ? locale
    : typeof locale === 'string'
      ? new Intl.Locale(locale)
      : new Intl.Locale(DEFAULT_LOCALE)
}

async function loadCommandResource<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  command: Command<Options>
): Promise<CommandResource<Options> | undefined> {
  let resource: CommandResource<Options> | undefined
  try {
    // TODO: should check the resource which is a dictionary object
    resource = await command.resource?.(ctx)
  } catch {}
  return resource
}
