/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ArgsValidationErrorKeys,
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

const i18nPluginId = namespacedId('i18n')

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

  if (isArgsValidationError(error) && error.code) {
    const values = await resolveValidationValues(ctx, error)
    const message = await localize(ctx, error.code, values)
    if (message && message !== error.code) {
      return message
    }
  }

  return error.message
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
