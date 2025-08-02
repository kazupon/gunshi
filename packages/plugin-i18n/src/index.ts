/**
 * The entry point of i18n plugin
 *
 * @example
 * ```js
 * import i18n from '@gunshi/plugin-i18n'
 * import { cli } from 'gunshi'
 *
 * const entry = (ctx) => {
 *   // ...
 * }
 *
 *
 * await cli(process.argv.slice(2), entry, {
 *   // ...
 *
 *   plugins: [
 *     i18n({
 *       locale: 'ja-JP', // specify the locale you want to use
 *       translationAdapterFactory: createTranslationAdapter, // optional, use default adapter
 *     })
 *   ],
 *
 *   // ...
 * })
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '@gunshi/plugin'
import {
  ARG_PREFIX_AND_KEY_SEPARATOR,
  BUILT_IN_PREFIX,
  DefaultResource,
  namespacedId,
  resolveArgKey,
  resolveBuiltInKey,
  resolveExamples,
  resolveKey
} from '@gunshi/shared'
import { createTranslationAdapter } from './translation.ts'
import { pluginId as id } from './types.ts'

import type {
  Command,
  CommandContext,
  DefaultGunshiParams,
  GunshiParamsConstraint,
  LazyCommand,
  PluginWithExtension
} from '@gunshi/plugin'
import type { BuiltinResourceKeys, CommandArgKeys, CommandBuiltinKeys } from '@gunshi/shared'
import type {
  CommandResource,
  I18nCommand,
  I18nCommandContext,
  I18nPluginOptions
} from './types.ts'

export { resolveArgKey, resolveBuiltInKey, resolveKey } from '@gunshi/shared'
export * from './helpers.ts'
export * from './translation.ts'
export * from './types.ts'

/**
 * The default locale string, which format is BCP 47 language tag.
 */
export const DEFAULT_LOCALE = 'en-US'

const BUILT_IN_PREFIX_CODE = BUILT_IN_PREFIX.codePointAt(0)

/**
 * i18n plugin
 *
 * @param options I18n plugin options
 * @returns A defined plugin as i18n
 */
export default function i18n(
  options: I18nPluginOptions = {}
): PluginWithExtension<I18nCommandContext<DefaultGunshiParams>> {
  // extract locale configuration from options
  const locale = toLocale(options.locale)
  const localeStr = toLocaleString(locale)

  const resources =
    options.resources ||
    (Object.create(null) as Record<string, Record<BuiltinResourceKeys, string>>)

  // create translation adapter
  const translationAdapterFactory = options.translationAdapterFactory || createTranslationAdapter
  const adapter = translationAdapterFactory({
    locale: localeStr,
    fallbackLocale: DEFAULT_LOCALE
  })

  // store built-in locale resources
  const localeBuiltinResources: Map<string, Record<string, string>> = new Map()

  // loaded built-in resource
  let builtInLoadedResources: Record<string, string> | undefined

  return plugin({
    id,
    name: 'internationalization',
    dependencies: [{ id: namespacedId('global'), optional: true }] as const,

    extension: async () => {
      // define translate function
      function translate<
        T extends string = CommandBuiltinKeys,
        O = CommandArgKeys<DefaultGunshiParams['args']>,
        K = CommandBuiltinKeys | O | T
      >(key: K, values: Record<string, unknown> = Object.create(null)): string {
        const strKey = key as string
        if (strKey.codePointAt(0) === BUILT_IN_PREFIX_CODE) {
          // handle built-in keys
          const resource =
            localeBuiltinResources.get(localeStr) || localeBuiltinResources.get(DEFAULT_LOCALE)!
          return resource[strKey as CommandBuiltinKeys] || strKey
        } else {
          // handle command-specific keys
          return adapter.translate(localeStr, strKey, values) || ''
        }
      }

      // define getResource function
      function getResource(
        locale: string | Intl.Locale
      ): Record<BuiltinResourceKeys, string> | undefined {
        const targetLocale = toLocale(locale)
        const targetLocaleStr = toLocaleString(targetLocale)
        return localeBuiltinResources.get(targetLocaleStr)
      }

      // define setResource function
      function setResource(
        locale: string | Intl.Locale,
        resource: Record<BuiltinResourceKeys, string>
      ): void {
        const targetLocale = toLocale(locale)
        const targetLocaleStr = toLocaleString(targetLocale)
        if (localeBuiltinResources.has(targetLocaleStr)) {
          return
        }
        localeBuiltinResources.set(targetLocaleStr, mapResourceWithBuiltinKey(resource))
      }

      // set default locale resources
      setResource(DEFAULT_LOCALE, DefaultResource as Record<BuiltinResourceKeys, string>)

      // install built-in locale resources
      for (const [locale, resource] of Object.entries(resources)) {
        setResource(locale, resource)
      }

      // keep built-in locale resources for later use
      builtInLoadedResources = getResource(locale)

      // define loadResource function
      async function loadResource(
        locale: string | Intl.Locale,
        ctx: CommandContext,
        cmd: Command
      ): Promise<boolean> {
        let loaded = false
        const originalResource = await loadCommandResource(ctx, cmd)
        if (originalResource) {
          const resource = await normalizeResource(originalResource, ctx)
          if (builtInLoadedResources) {
            // NOTE(kazupon): setup resource for global opsions
            resource.help = builtInLoadedResources.help
            resource.version = builtInLoadedResources.version
          }
          adapter.setResource(toLocaleString(locale), resource)
          loaded = true
        }
        return loaded
      }

      return {
        locale,
        translate,
        loadResource
      }
    },

    onExtension: async (ctx, cmd) => {
      const i18n = ctx.extensions[id]

      /**
       * load command resources, after the command context is extended
       */

      // extract option descriptions from command options
      const loadedOptionsResources = Object.entries(ctx.args).map(
        ([key, schema]) => [key, schema.description || ''] as [string, string]
      )

      const defaultCommandResource = loadedOptionsResources.reduce((res, [key, value]) => {
        res[resolveArgKey(key, ctx)] = value
        return res
      }, Object.create(null))
      defaultCommandResource[resolveKey('description', ctx)] = cmd.description || ''
      defaultCommandResource[resolveKey('examples', ctx)] = await resolveExamples(ctx, cmd.examples)
      adapter.setResource(DEFAULT_LOCALE, defaultCommandResource)

      // load resource for target command
      await i18n.loadResource(localeStr, ctx as unknown as CommandContext, cmd)
    }
  })
}

function toLocale(locale: string | Intl.Locale | undefined): Intl.Locale {
  return locale instanceof Intl.Locale
    ? locale
    : typeof locale === 'string'
      ? new Intl.Locale(locale)
      : new Intl.Locale(DEFAULT_LOCALE)
}

function toLocaleString(locale: string | Intl.Locale): string {
  return locale instanceof Intl.Locale ? locale.toString() : locale
}

async function loadCommandResource(
  ctx: CommandContext,
  command: Command | LazyCommand
): Promise<CommandResource | undefined> {
  // check if command has i18n resource support
  if (!hasI18nResource(command)) {
    return undefined
  }

  let resource: CommandResource | undefined
  try {
    resource = await command.resource!(ctx)
  } catch (error) {
    console.error(`Failed to load resource for command "${command.name}":`, error)
  }
  return resource
}

function mapResourceWithBuiltinKey(resource: Record<string, string>): Record<string, string> {
  return Object.entries(resource).reduce((acc, [key, value]) => {
    acc[resolveBuiltInKey(key)] = value
    return acc
  }, Object.create(null))
}

function hasI18nResource<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  command: Command<G>
): command is I18nCommand<G> {
  return 'resource' in command && typeof command.resource === 'function'
}

async function normalizeResource(
  resource: CommandResource,
  ctx: CommandContext
): Promise<Record<string, string>> {
  const ret: Record<string, string> = Object.create(null)
  for (const [key, value] of Object.entries(resource as Record<string, string>)) {
    if (key.startsWith(ARG_PREFIX_AND_KEY_SEPARATOR)) {
      // argument key
      ret[resolveKey(key, ctx)] = value
    } else {
      if (key === 'examples') {
        // examples key
        ret[resolveKey('examples', ctx)] = await resolveExamples(ctx, value)
      } else {
        // other keys
        ret[resolveKey(key, ctx)] = value
      }
    }
  }
  return ret
}
