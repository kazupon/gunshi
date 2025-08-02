/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { CommandContext, DefaultGunshiParams, GunshiParams } from '@gunshi/plugin'

/**
 * Render the validation errors.
 *
 * @param ctx A {@link CommandContext | command context}
 * @param error An {@link AggregateError} of option in `args-token` validation
 * @returns A rendered validation error.
 */
export function renderValidationErrors<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>, // eslint-disable-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars -- NOTE(kazupon): This is used in the function signature
  error: AggregateError
): Promise<string> {
  const messages = [] as string[]
  for (const err of error.errors as Error[]) {
    messages.push(err.message)
  }
  return Promise.resolve(messages.join('\n'))
}
