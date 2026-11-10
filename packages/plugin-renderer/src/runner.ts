/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

/**
 * The commands that `loadCommands` resolved from a command without `run`.
 *
 * NOTE(kazupon): `loadCommands` resolves the commands without the loader of a lazy command, so a resolved
 * command never has the runner of a lazy command. Whether a command has a runner is known from the command
 * that was given, so it is recorded for each command when the command is resolved: a lazy command always
 * has a runner, which its loader returns, and a function given as the entry is one.
 */
const resolvedWithoutRun = new WeakSet<object>()

/**
 * Record whether the command that was given has no `run`, for the command resolved from it.
 *
 * @param given - The command that was given: one of the sub-commands of the context, or its entry command
 * @param resolved - The command that `loadCommands` resolved from it
 * @returns The resolved command
 */
export function recordRunner<C extends object>(given: unknown, resolved: C): C {
  if (typeof given === 'object' && given !== null && (given as { run?: unknown }).run == null) {
    resolvedWithoutRun.add(resolved)
  }
  return resolved
}

/**
 * Check if a command that `loadCommands` resolved comes from a command without `run`.
 *
 * @param resolved - A command from `loadCommands`
 * @returns `true` if the command that was given has no `run`
 */
export function isResolvedWithoutRun(resolved: object): boolean {
  return resolvedWithoutRun.has(resolved)
}

/**
 * The commands that `loadCommands` resolved from the command of the context, whose help is printed.
 *
 * NOTE(kazupon): the core lists the command of the context among its sub-commands, marked with `entry`: the
 * entry at the root, and a copy of a group under the last name of its path at a nested level. A plugin may
 * add a command with the same name, marked with `entry` too, so the row is told by the command that it
 * comes from, not by its name.
 */
const resolvedFromContext = new WeakSet<object>()

/**
 * Record whether the command that was given is the command of the context, for the command resolved from
 * it.
 *
 * @param given - The command that was given: one of the sub-commands of the context, or its entry command
 * @param own - The command of the context, as the core lists it among its sub-commands
 * @param resolved - The command that `loadCommands` resolved from it
 * @returns The resolved command
 */
export function recordContextCommand<C extends object>(
  given: unknown,
  own: unknown,
  resolved: C
): C {
  if (own != null && given === own) {
    resolvedFromContext.add(resolved)
  }
  return resolved
}

/**
 * Check if a command that `loadCommands` resolved comes from the command of the context.
 *
 * @param resolved - A command from `loadCommands`
 * @returns `true` if the command that was given is the command of the context
 */
export function isResolvedFromContext(resolved: object): boolean {
  return resolvedFromContext.has(resolved)
}

/**
 * The key of the registry in which the core keeps the command contexts whose command has no `run`. The
 * key is a registered symbol, since `gunshi` and the plugins bundle their own copies.
 */
const WITHOUT_RUN = Symbol.for('gunshi.withoutRun')

/**
 * Check if the command of a run has no `run`, by the registry that the core keeps. The core checks the
 * command that it loaded, a lazy one included, which `loadCommands` does not load.
 *
 * @param ctx - The command context of the run
 * @returns `true` if the core marked the context as the one of a command without `run`
 */
export function isMarkedWithoutRun(ctx: object): boolean {
  const registry = (globalThis as unknown as Record<symbol, WeakSet<object> | undefined>)[
    WITHOUT_RUN
  ]
  return registry?.has(ctx) === true
}
