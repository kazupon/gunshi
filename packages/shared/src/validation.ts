/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ArgsValidationErrorKeys,
  isArgsValidationError,
  isCommandNotFoundError,
  isCommandResolutionError
} from '@gunshi/plugin'
import { BUILD_IN_PREFIX_AND_KEY_SEPARATOR } from './constants.ts'
import { formatResource } from './localization.ts'
import DefaultResource from './resource.ts'
import { namespacedId, resolveKey } from './utils.ts'

import type {
  ArgsValidationError,
  CommandContext,
  DefaultGunshiParams,
  GunshiParams
} from '@gunshi/plugin'
import type { ArgErrorHintResourceKeys } from './types.ts'

const i18nPluginId = namespacedId('i18n')

const missingValueHintKey = 'err:arg:missing-value:hint' satisfies ArgErrorHintResourceKeys

/**
 * Localize the message of a validation error, as gunshi shows it to the user: with the i18n plugin when
 * it is installed, and otherwise the message of the error.
 *
 * NOTE(kazupon): the renderer plugin renders the validation errors for people, and the global options
 * plugin prints them as JSON with `--json`. Both take the messages from here, so that a message is the
 * same in both.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @param error - A validation error: an {@link ArgsValidationError}, a command-not-found error, or a
 * command-resolution error
 * @returns The localized message
 */
export async function localizeValidationError<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>,
  error: Error
): Promise<string> {
  if (isCommandNotFoundError(error) && error.code) {
    const message = await localize(ctx, error.code, error.values)
    if (message && message !== error.code) {
      return message
    }
  }

  if (isCommandResolutionError(error) && error.code) {
    const message = await localize(ctx, error.code, error.values)
    if (message && message !== error.code) {
      return message
    }
  }

  if (isArgsValidationError(error) && error.code) {
    const values = await resolveValidationValues(ctx, error)
    const message = await localize(ctx, error.code, values)
    if (message && message !== error.code) {
      const hint = await localizeHint(ctx, error, values)
      return hint ? `${message} ${hint}` : message
    }
  }

  return error.message
}

/**
 * Localize a text of the built-in resources: with the i18n plugin when it is installed and knows the key,
 * and otherwise the English one.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @param key - The key of the text: `_:<key>` for a text that is not an error, and the key itself for an
 * error, such as `err:json:not-supported`
 * @param values - The values of the placeholders of the text
 * @returns The localized text, or the key when no resource has it
 */
export async function localizeBuiltinResource<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>,
  key: string,
  values?: Record<string, unknown>
): Promise<string> {
  const message = await localize(ctx, key, values)
  if (message && message !== key) {
    return message
  }
  const resourceKey = key.startsWith(BUILD_IN_PREFIX_AND_KEY_SEPARATOR)
    ? key.slice(BUILD_IN_PREFIX_AND_KEY_SEPARATOR.length)
    : key
  return (
    formatResource((DefaultResource as Record<string, string | undefined>)[resourceKey], values) ||
    key
  )
}

/**
 * Localize the hint that args-tokens adds to the message of an error.
 *
 * A translation replaces the whole message, hint included, so the hint is translated by a key of
 * its own and follows the translated error. args-tokens gives one today: for an option given without
 * a value, when the argument after it may be the value, the long form with `=` (`--port=-5` for
 * `--port -5`), in `values.next` and `values.suggestion`.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @param error - An args validation error
 * @param values - The values of the error, as given to its translation
 * @returns The localized hint, or `undefined` when the error has none.
 */
async function localizeHint<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>,
  error: ArgsValidationError,
  values: Record<string, unknown>
): Promise<string | undefined> {
  if (
    error.code !== ArgsValidationErrorKeys.missingValue ||
    typeof values.next !== 'string' ||
    typeof values.suggestion !== 'string'
  ) {
    return undefined
  }

  const hint = await localize(ctx, missingValueHintKey, values)
  return hint && hint !== missingValueHintKey ? hint : undefined
}

async function resolveValidationValues<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>,
  error: ArgsValidationError
): Promise<Record<string, unknown>> {
  if (error.code !== ArgsValidationErrorKeys.customParse) {
    return error.values
  }

  const { reasonKey, reasonValues } = error.values
  if (typeof reasonKey !== 'string') {
    return error.values
  }

  const key = resolveKey(reasonKey, ctx.name)
  const localizedReason = await localize(ctx, key, toRecord(reasonValues))
  if (!localizedReason || localizedReason === key) {
    return error.values
  }

  return {
    ...error.values,
    reason: localizedReason
  }
}

async function localize<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>,
  key: string,
  values?: Record<string, unknown>
): Promise<string> {
  const i18n = (
    ctx.extensions as
      | Record<string, { translate?: (key: string, values?: Record<string, unknown>) => string }>
      | undefined
  )?.[i18nPluginId]

  if (i18n?.translate) {
    return i18n.translate(key, values)
  }

  return key
}

function toRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : (Object.create(null) as Record<string, unknown>)
}
