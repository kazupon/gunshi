/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ARG_NEGATABLE_PREFIX,
  ARG_PREFIX_AND_KEY_SEPARATOR,
  BUILD_IN_PREFIX_AND_KEY_SEPARATOR
} from './constants.ts'
import DefaultResource from './resource.ts'
import { makeShortLongOptionPair, resolveExamples, resolveKey } from './utils.ts'

import type { Args, Command, CommandContext } from 'gunshi'
import type { ResolveTranslationKeys, Translation } from './types.ts'

/**
 * Localization function type.
 */
export interface Localization<
  A extends Args,
  C = {}, // for CommandContext
  E extends Record<string, string> = {} // for extended resources
> {
  <K = ResolveTranslationKeys<A, C, E>>(key: K, values?: Record<string, unknown>): string
}

/**
 * Create a localizable function for a command.
 * This function will resolve the translation key based on the command context and the provided translation function.
 *
 * @param ctx Command context
 * @param cmd Command
 * @param translate Translation function
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
      return DefaultResource[resKey as keyof typeof DefaultResource] || (key as string)
    }

    const namaspacedArgKey = resolveKey(ARG_PREFIX_AND_KEY_SEPARATOR, ctx)
    if ((key as string).startsWith(namaspacedArgKey)) {
      let argKey = (key as string).slice(namaspacedArgKey.length)
      let negatable = false
      if (argKey.startsWith(ARG_NEGATABLE_PREFIX)) {
        argKey = argKey.slice(ARG_NEGATABLE_PREFIX.length)
        negatable = true
      }
      const schema = ctx.args[argKey as keyof typeof ctx.args]
      if (!schema) {
        return argKey
      }
      return negatable && schema.type === 'boolean' && schema.negatable
        ? `${DefaultResource['NEGATABLE']} ${makeShortLongOptionPair(schema, argKey, ctx.toKebab)}`
        : schema.description || ''
    }

    // if the key is a built-in key 'description' and 'examples', return empty string, because the these keys are resolved by the user.
    if (key === resolveKey('description', ctx)) {
      return ''
    } else if (key === resolveKey('examples', ctx)) {
      return await resolveExamples(ctx, cmd.examples)
    } else {
      return key as string
    }
  }

  return localize as unknown as Localization<A, C, E>
}
