/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args, ArgExplicitlyProvided, ArgValues } from 'args-tokens'
import type { Awaitable, ValueResolutionSources } from './types.ts'

/**
 * Apply the onResolveValue hook if provided, falling back to the original values.
 *
 * @typeParam A - The Args type from command definition
 *
 * @param hook - The onResolveValue hook from CLI options, if registered
 * @param values - Parsed argument values with schema defaults filled in
 * @param explicit - Map of which keys were explicitly provided via CLI
 * @returns The resolved values from the hook, or the original values if no hook or hook returns undefined
 */
export async function resolveValue<A extends Args>(
  hook: ((sources: ValueResolutionSources<A>) => Awaitable<ArgValues<A> | undefined>) | undefined,
  values: ArgValues<A>,
  explicit: ArgExplicitlyProvided<A>
): Promise<ArgValues<A>> {
  if (!hook) {
    return values
  }
  // Pass a frozen shallow copy so hook cannot mutate the original values;
  // the original is preserved as the fallback when the hook returns undefined.
  const snapshot = Object.freeze({ ...values }) as ArgValues<A>
  return (await hook({ values: snapshot, explicit })) ?? values
}
