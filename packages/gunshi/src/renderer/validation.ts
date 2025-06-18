/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { CommandContext, DefaultGunshiParams, GunshiParams } from '../types.ts'

/**
 * Render the validation errors.
 * @param ctx A {@link CommandContext | command context}
 * @param error An {@link AggregateError} of option in `args-token` validation
 * @returns A rendered validation error.
 */
export function renderValidationErrors<G extends GunshiParams = DefaultGunshiParams>(
  _ctx: CommandContext<G>,
  error: AggregateError
): Promise<string> {
  const messages = [] as string[]
  for (const err of error.errors as Error[]) {
    messages.push(err.message)
  }
  return Promise.resolve(messages.join('\n'))
}
