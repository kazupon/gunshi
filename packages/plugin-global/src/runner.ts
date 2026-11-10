/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

/**
 * The key of the registry in which the core keeps the command contexts whose command has no `run`. The
 * key is a registered symbol, since `gunshi` and the plugins bundle their own copies.
 */
const WITHOUT_RUN = Symbol.for('gunshi.withoutRun')

/**
 * Check if the command of a run has no `run`, by the registry that the core keeps.
 *
 * @param ctx - The command context of the run
 * @returns `true` if the core marked the context as the one of a command without `run`
 */
export function isWithoutRun(ctx: object): boolean {
  const registry = (globalThis as unknown as Record<symbol, WeakSet<object> | undefined>)[
    WITHOUT_RUN
  ]
  return registry?.has(ctx) === true
}
