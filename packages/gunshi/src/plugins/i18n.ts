/**
 * i18n (internationalization) plugin for gunshi
 *
 * @example
 * ```js
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import DefaultResource from '../locales/en-US.json' with { type: 'json' }
import { plugin } from '../plugin.ts'
import { createTranslationAdapter } from '../translation.ts'
import { create, mapResourceWithBuiltinKey, resolveArgKey, resolveExamples } from '../utils.ts'

import type {
  Command,
  CommandArgKeys,
  CommandBuiltinKeys,
  CommandContext,
  CommandContextCore,
  CommandResource,
  DefaultGunshiParams,
  GunshiParams,
  LazyCommand,
  TranslationAdapterFactory
} from '../types.ts'

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
  locale: Intl.Locale
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

const BUILT_IN_PREFIX_CODE = '_'.codePointAt(0)

/**
 * i18n plugin options
 */
interface I18nPluginOptions {
  /**
   * Locale to use for translations
   */
  locale?: string | Intl.Locale
  /**
   * Translation adapter factory
   */
  translationAdapterFactory?: TranslationAdapterFactory
}

/**
 * i18n plugin
 */
export default function i18n(options: I18nPluginOptions = {}) {
  return plugin({
    name: 'i18n',

    dependencies: [{ name: 'globals', optional: true }],

    extension: async (ctx: CommandContextCore, cmd: Command) => {
      // extract locale configuration from options
      const locale = resolveLocale(options.locale)
      const localeStr = locale.toString()

      // create translation adapter
      const translationAdapterFactory =
        options.translationAdapterFactory || createTranslationAdapter
      const adapter = translationAdapterFactory({
        locale: localeStr,
        fallbackLocale: DEFAULT_LOCALE
      })

      // store built-in locale resources
      const localeBuiltinResources: Map<string, Record<string, string>> = new Map()

      let builtInLoadedResources: Record<string, string> | undefined

      // load default built-in resources
      localeBuiltinResources.set(DEFAULT_LOCALE, mapResourceWithBuiltinKey(DefaultResource))

      // load locale-specific resources asynchronously if needed
      if (DEFAULT_LOCALE !== localeStr) {
        builtInLoadedResources = await loadBuiltInLocaleResources(localeBuiltinResources, localeStr)
      }

      // define translate function
      function translate<
        T extends string = CommandBuiltinKeys,
        O = CommandArgKeys<DefaultGunshiParams['args']>,
        K = CommandBuiltinKeys | O | T
      >(key: K, values: Record<string, unknown> = create<Record<string, unknown>>()): string {
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

      // extract option descriptions from command options
      const loadedOptionsResources = Object.entries(ctx.args).map(
        ([key, schema]) => [key, schema.description || ''] as [string, string]
      )

      const defaultCommandResource = loadedOptionsResources.reduce((res, [key, value]) => {
        res[resolveArgKey(key)] = value
        return res
      }, create<Record<string, string>>())
      defaultCommandResource.description = cmd.description || ''
      defaultCommandResource.examples = await resolveExamples(ctx, cmd.examples)
      adapter.setResource(DEFAULT_LOCALE, defaultCommandResource)

      // console.log('load command resource', locale.toString())
      // FiXME(kazupon): should be removed, if built-in plugin is self-hosted
      const originalResource = await loadCommandResource<DefaultGunshiParams>(ctx, cmd)
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

      return {
        locale,
        translate
      } as I18nCommandContext
    }
  })
}

function resolveLocale(locale: string | Intl.Locale | undefined): Intl.Locale {
  return locale instanceof Intl.Locale
    ? locale
    : typeof locale === 'string'
      ? new Intl.Locale(locale)
      : new Intl.Locale(DEFAULT_LOCALE)
}

async function loadBuiltInLocaleResources(
  localeResources: Map<string, Record<string, string>>,
  targetLocale: string
): Promise<Record<string, string> | undefined> {
  let targetResource: Record<string, string> | undefined
  try {
    targetResource = (
      (await import(`../locales/${targetLocale}.json`, {
        with: { type: 'json' }
      })) as { default: Record<string, string> }
    ).default
    localeResources.set(targetLocale, mapResourceWithBuiltinKey(targetResource))
  } catch {
    // target locale might not exist, fallback to default
  }
  return targetResource
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
