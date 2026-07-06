/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ArgsValidationErrorKeys, isArgsValidationError } from 'args-tokens'
import { DefaultResource, resolveKey } from '@gunshi/shared'
import { pluginId } from './types.ts'

import type { CommandContext, DefaultGunshiParams, GunshiParams } from '@gunshi/plugin'
import type { ArgsValidationError } from 'args-tokens'

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

  const { reason, reasonKey, reasonValues } = error.values
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
    reason: localizedReason || reason
  }
}

async function localize<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>,
  key: string,
  values?: Record<string, unknown>
): Promise<string> {
  const renderer = (
    ctx.extensions as
      | Record<
          string,
          { text?: (key: string, values?: Record<string, unknown>) => Promise<string> }
        >
      | undefined
  )?.[pluginId]

  if (renderer?.text) {
    return await renderer.text(key, values)
  }

  return formatResource(DefaultResource[key as keyof typeof DefaultResource], values) || key
}

function toRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : (Object.create(null) as Record<string, unknown>)
}

function formatResource(
  resource: string | undefined,
  values: Record<string, unknown> = Object.create(null) as Record<string, unknown>
): string | undefined {
  return resource?.replaceAll(/\{\$(\w+)\}/g, (_: string | RegExp, name: string): string => {
    return values[name] == null ? '' : String(values[name])
  })
}
