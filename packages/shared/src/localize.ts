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
import { makeShortLongOptionPair, resolveExamples } from './utils.ts'

import type { Command, CommandContext, DefaultGunshiParams, GunshiParams } from 'gunshi'
import type { CommandArgKeys, CommandBuiltinKeys, Translation } from './types.ts'

export interface Localization<
  T extends string = CommandBuiltinKeys,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  G extends GunshiParams<any> = DefaultGunshiParams
> {
  <O = CommandArgKeys<G['args']>, K = CommandBuiltinKeys | O | T>(
    key: K,
    values?: Record<string, unknown>
  ): Promise<string>
}

export function localizable<T extends string = CommandBuiltinKeys>(
  ctx: CommandContext,
  cmd: Command,
  translate?: Translation<T>
): Localization<T> {
  async function localize(key: string, values?: Record<string, unknown>): Promise<string> {
    if (translate) {
      return translate<T>(key as T, values)
    } else {
      if ((key as string).startsWith(BUILD_IN_PREFIX_AND_KEY_SEPARATOR)) {
        const resKey = (key as string).slice(BUILD_IN_PREFIX_AND_KEY_SEPARATOR.length)
        return DefaultResource[resKey as keyof typeof DefaultResource] || (key as string)
      } else if ((key as string).startsWith(ARG_PREFIX_AND_KEY_SEPARATOR)) {
        let argKey = (key as string).slice(ARG_PREFIX_AND_KEY_SEPARATOR.length)
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
      } else {
        // if the key is a built-in key 'description' and 'examples', return empty string, because the these keys are resolved by the user.
        if (key === 'description') {
          return ''
        } else if (key === 'examples') {
          return await resolveExamples(ctx, cmd.examples)
        } else {
          return key as string
        }
      }
    }
  }

  return localize as Localization<T>
}
