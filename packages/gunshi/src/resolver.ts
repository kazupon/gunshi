/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ArgResolveError } from 'args-tokens'
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

/**
 * Recompute the validation error after the onResolveValue hook has run.
 *
 * Required-argument errors are dropped for any key whose value is now
 * non-nullish in `resolvedValues`; all other errors (type, conflict, etc.)
 * are kept unchanged.
 *
 * @typeParam A - The Args type from command definition
 *
 * @param error - The AggregateError produced by resolveArgs before the hook ran
 * @param args - The Args schema used during parsing (used to map schema references back to raw keys)
 * @param resolvedValues - The final values after the hook has been applied
 * @returns A new AggregateError containing only the still-failing errors, or undefined if all errors are resolved
 */
export function revalidateError<A extends Args>(
  error: AggregateError | undefined,
  args: A,
  resolvedValues: ArgValues<A>
): AggregateError | undefined {
  if (!error) return undefined

  const values = resolvedValues as Record<string, unknown>

  // Build a reverse map from schema object reference → rawArg key so that we
  // can look up keys without having to re-apply kebab-case conversion logic.
  const schemaToKey = new Map<object, string>()
  for (const [rawArg, schema] of Object.entries(args)) {
    schemaToKey.set(schema, rawArg)
  }

  const remaining = (error.errors as Error[]).filter(err => {
    if (!(err instanceof ArgResolveError) || err.type !== 'required') return true
    const rawArg = schemaToKey.get(err.schema)
    if (rawArg == null) return true // Cannot match schema — keep the error conservatively
    return values[rawArg] == null
  })

  return remaining.length > 0 ? new AggregateError(remaining) : undefined
}
