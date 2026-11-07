/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { localizeValidationError } from '@gunshi/shared'

import type { CommandContext, DefaultGunshiParams, GunshiParams } from '@gunshi/plugin'

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
    messages.push(await localizeValidationError(ctx, err))
  }
  return messages.join('\n')
}
