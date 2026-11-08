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
