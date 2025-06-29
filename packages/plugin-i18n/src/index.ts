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
import { BUILT_IN_PREFIX } from '../../shared/constants.ts'
import DefaultResource from '../../shared/resource.ts'
import { resolveArgKey, resolveBuiltInKey, resolveExamples } from '../../shared/utils.ts' // for type checking
import { createTranslationAdapter } from './translation.ts'

import type {
  Command,
  CommandContext,
  CommandResource,
  DefaultGunshiParams,
  GunshiParams,
  LazyCommand,
  PluginWithExtension
} from '@gunshi/plugin'
import type { BuiltinResourceKeys, CommandArgKeys, CommandBuiltinKeys } from '../../shared/types.ts'
import type { TranslationAdapterFactory } from './types.ts'

export type * from './types.ts'

/**
 * The default locale string, which format is BCP 47 language tag.
 */
const DEFAULT_LOCALE = 'en-US'

/**
 * Extended command context which provides utilities via i18n plugin.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface I18nCommandContext<G extends GunshiParams<any> = DefaultGunshiParams> {
  /**
   * Command locale
   */
  locale: string | Intl.Locale
  /**
   * Translate a message
   * @param key Translation key
   * @param values Values to interpolate
   * @returns Translated message
   */
  translate: <
    T extends string = CommandBuiltinKeys,
    O = CommandArgKeys<G['args']>,
    K = CommandBuiltinKeys | O | T
  >(
    key: K,
    values?: Record<string, unknown>
  ) => string
}

const BUILT_IN_PREFIX_CODE = BUILT_IN_PREFIX.codePointAt(0)

/**
 * i18n plugin options
 */
export interface I18nPluginOptions {
  /**
   * Locale to use for translations
   */
  locale?: string | Intl.Locale
  /**
   * Translation adapter factory
   */
  translationAdapterFactory?: TranslationAdapterFactory
  /**
   * Built-in localizable resources
   */
  resources?: Record<string, Record<BuiltinResourceKeys, string>>
}

/**
 * i18n plugin
 */
export default function i18n(
  options: I18nPluginOptions = {}
): PluginWithExtension<Promise<I18nCommandContext<DefaultGunshiParams>>> {
  // extract locale configuration from options
  const locale = toLocale(options.locale)
  const localeStr = locale.toString()

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
    name: 'i18n',

    dependencies: [{ name: 'globals', optional: true }],

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
        const targetLocaleStr = targetLocale.toString()
        return localeBuiltinResources.get(targetLocaleStr)
      }

      // define setResource function
      function setResource(
        locale: string | Intl.Locale,
        resource: Record<BuiltinResourceKeys, string>
      ): void {
        const targetLocale = toLocale(locale)
        const targetLocaleStr = targetLocale.toString()
        if (localeBuiltinResources.has(targetLocaleStr)) {
          return
        }
        localeBuiltinResources.set(targetLocale.toString(), mapResourceWithBuiltinKey(resource))
      }

      // set default locale resources
      setResource(DEFAULT_LOCALE, DefaultResource)

      // install built-in locale resources
      for (const [locale, resource] of Object.entries(resources)) {
        setResource(locale, resource)
      }

      // keep built-in locale resources for later use
      builtInLoadedResources = getResource(locale)

      return {
        locale,
        translate
      } as I18nCommandContext
    },

    onExtension: async (ctx, cmd) => {
      /**
       * load command resources, after the command context is extended
       */

      // extract option descriptions from command options
      const loadedOptionsResources = Object.entries(ctx.args).map(
        ([key, schema]) => [key, schema.description || ''] as [string, string]
      )

      const defaultCommandResource = loadedOptionsResources.reduce((res, [key, value]) => {
        res[resolveArgKey(key)] = value
        return res
      }, Object.create(null))
      defaultCommandResource.description = cmd.description || ''
      defaultCommandResource.examples = await resolveExamples<typeof ctx>(ctx, cmd.examples)
      adapter.setResource(DEFAULT_LOCALE, defaultCommandResource)

      const originalResource = await loadCommandResource<typeof ctx>(ctx, cmd)
      if (originalResource) {
        const resource = Object.assign(
          Object.create(null),
          originalResource as Record<string, string>,
          {
            examples: await resolveExamples<typeof ctx>(ctx, originalResource.examples)
          } as Record<string, string>
        )
        if (builtInLoadedResources) {
          // NOTE(kazupon): setup resource for global opsions
          resource.help = builtInLoadedResources.help
          resource.version = builtInLoadedResources.version
        }
        adapter.setResource(localeStr, resource)
      }
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

async function loadCommandResource<G extends GunshiParams>(
  ctx: CommandContext<G>,
  command: Command<G> | LazyCommand<G>
): Promise<CommandResource<G> | undefined> {
  let resource: CommandResource<G> | undefined
  try {
    // TODO(kazupon): should check the resource which is a dictionary object
    resource = await command.resource?.(ctx)
  } catch {}
  return resource
}

function mapResourceWithBuiltinKey(resource: Record<string, string>): Record<string, string> {
  return Object.entries(resource).reduce((acc, [key, value]) => {
    acc[resolveBuiltInKey(key)] = value
    return acc
  }, Object.create(null))
}
