/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ArgsValidationErrorKeys,
  isCommandResolutionError,
  isArgsValidationError,
  isCommandNotFoundError
} from '@gunshi/plugin'
import { namespacedId, resolveKey } from '@gunshi/shared'

import type {
  ArgsValidationError,
  CommandContext,
  DefaultGunshiParams,
  GunshiParams
} from '@gunshi/plugin'
import type { ArgErrorHintResourceKeys } from '@gunshi/shared'

const i18nPluginId = namespacedId('i18n')

const missingValueHintKey = 'err:arg:missing-value:hint' satisfies ArgErrorHintResourceKeys

/**
 * Render the validation errors.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @param error - An {@link AggregateError} of option in `args-token` validation
 * @returns A rendered validation error.
 */
export async function renderValidationErrors<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>,
  error: AggregateError
): Promise<string> {
  const messages = [] as string[]
  for (const err of error.errors as Error[]) {
    messages.push(await renderValidationError(ctx, err))
  }
  return messages.join('\n')
}

async function renderValidationError<G extends GunshiParams = DefaultGunshiParams>(
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
