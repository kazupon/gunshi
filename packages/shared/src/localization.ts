/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ARG_NEGATABLE_PREFIX,
  ARG_PREFIX_AND_KEY_SEPARATOR,
  BUILD_IN_PREFIX_AND_KEY_SEPARATOR,
  ERROR_PREFIX_AND_KEY_SEPARATOR
} from './constants.ts'
import DefaultResource from './resource.ts'
import { makeShortLongOptionPair, resolveExamples, resolveKey } from './utils.ts'

import type { Args, Command, CommandContext } from 'gunshi'
import type { ResolveTranslationKeys, Translation } from './types.ts'

/**
 * Localization function type.
 *
 * @typeParam A - The {@linkcode Args} type extracted from Gunshi command.
 * @typeParam C - Additional context type for command localization.
 * @typeParam E - Extended resource keys type.
 */
export interface Localization<
  A extends Args,
  C = {}, // for CommandContext
  E extends Record<string, string> = {} // for extended resources
> {
  <K = ResolveTranslationKeys<A, C, E>>(key: K, values?: Record<string, unknown>): Promise<string>
}

/**
 * Create a localizable function for a command.
 *
 * This function will resolve the translation key based on the command context and the provided translation function.
 *
 * @typeParam A - The {@linkcode Args} type extracted from Gunshi command.
 * @typeParam C - Additional context type for command localization.
 * @typeParam E - Extended resource keys type.
 *
 * @param ctx - Command context
 * @param cmd - Command
 * @param translate - Translation function
 * @returns Localizable function
 */
export function localizable<
  A extends Args,
  C = {}, // for CommandContext
  E extends Record<string, string> = {}, // for extended resources
  K = ResolveTranslationKeys<A, C, E>
>(ctx: CommandContext, cmd: Command, translate?: Translation<A, C, E, K>): Localization<A, C, E> {
  async function localize(key: K, values?: Record<string, unknown>): Promise<string> {
    if (translate) {
      return translate(key, values)
    }

    if ((key as string).startsWith(BUILD_IN_PREFIX_AND_KEY_SEPARATOR)) {
      const resKey = (key as string).slice(BUILD_IN_PREFIX_AND_KEY_SEPARATOR.length)
      return resolveAndFormatResource(resKey, key as string, values)
    }

    if ((key as string).startsWith(ERROR_PREFIX_AND_KEY_SEPARATOR)) {
      return resolveAndFormatResource(key as string, key as string, values)
    }

    const namaspacedArgKey = resolveKey(ARG_PREFIX_AND_KEY_SEPARATOR, ctx.name)
    if ((key as string).startsWith(namaspacedArgKey)) {
      const argKey = (key as string).slice(namaspacedArgKey.length)

      /**
       * NOTE(kazupon): an argument describes itself, whatever it is called. `no-` is stripped only
       * to reach the option that a negated form negates, and only when there is no argument under
       * the name as written: `no-emoji` may be an argument of its own, and it then has nothing to do
       * with `emoji`.
       */
      const ownSchema = ctx.args[argKey as keyof typeof ctx.args]
      if (ownSchema) {
        return ownSchema.description || ''
      }

      if (argKey.startsWith(ARG_NEGATABLE_PREFIX)) {
        const negatedKey = argKey.slice(ARG_NEGATABLE_PREFIX.length)
        const schema = ctx.args[negatedKey as keyof typeof ctx.args]
        if (schema && schema.type === 'boolean' && schema.negatable) {
          return `${DefaultResource['NEGATABLE']} ${makeShortLongOptionPair(schema, negatedKey, ctx.toKebab)}`
        }
      }

      return argKey
    }

    // if the key is a built-in key 'description' and 'examples', return empty string, because the these keys are resolved by the user.
    if (key === resolveKey('description', ctx.name)) {
      return ''
    } else if (key === resolveKey('examples', ctx.name)) {
      return await resolveExamples(ctx, cmd.examples)
    } else {
      return key as string
    }
  }

  return localize as unknown as Localization<A, C, E>
}

function resolveAndFormatResource(
  resourceKey: string,
  fallbackKey: string,
  values?: Record<string, unknown>
): string {
  return (
    formatResource(DefaultResource[resourceKey as keyof typeof DefaultResource], values) ||
    fallbackKey
  )
}

/**
 * Format a resource message by replacing placeholder values.
 *
 * @param resource - Resource message template
 * @param values - Placeholder values
 * @returns Formatted resource message
 */
export function formatResource(
  resource: string | undefined,
  values: Record<string, unknown> = Object.create(null) as Record<string, unknown>
): string | undefined {
  return resource?.replaceAll(/\{\$(\w+)\}/g, (_: string, name: string): string => {
    return values[name] == null ? '' : String(values[name])
  })
}
