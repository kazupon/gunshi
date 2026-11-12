/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { resolveBuiltInKey, resolveDisplayName } from './utils.ts'
import { localizeBuiltinResource } from './validation.ts'

import type { ArgSchema, CommandContext, DefaultGunshiParams, GunshiParams } from '@gunshi/plugin'

/**
 * A deprecated command on the path of a run, as the core of gunshi marks it on the context.
 */
export interface DeprecatedCommand {
  /**
   * The names of the commands on the path to the command, its own name last: `['seed', 'apply']`.
   */
  readonly commandPath: readonly string[]
  /**
   * The `deprecated` of the command: `true`, or the text that tells what to use instead.
   */
  readonly deprecated: true | string
}

/**
 * The key of the registry in which the core of gunshi keeps the deprecated commands on the path of a run, by its
 * command context: the same registered symbol as the one of the core, which marks the context.
 */
const DEPRECATED_COMMANDS = Symbol.for('gunshi.deprecatedCommands')

/**
 * The key of the built-in resource of the sentence that tells that a command or an argument is deprecated.
 */
const DEPRECATED = resolveBuiltInKey('DEPRECATED')

/**
 * Get the deprecated commands on the path of a run, root first, by the mark that the core of gunshi puts on its
 * context.
 *
 * NOTE(kazupon): the context has the command that runs, and not the commands above it, such as the old name of a
 * renamed group, so the core, which walks the path, marks the context. The global options plugin warns of them,
 * and says so in the help as JSON, and the usage renderer plugin says so in the help. As for `isWithoutRun`, the
 * core keeps its own key and its writer out of the public API, and the tests pin this reader to the mark of the
 * core.
 *
 * @param ctx - The command context of the run
 * @returns The deprecated commands on the path, or an empty array
 */
export function getDeprecatedCommands(ctx: object): readonly DeprecatedCommand[] {
  const registry = (
    globalThis as unknown as Record<
      symbol,
      WeakMap<object, readonly DeprecatedCommand[]> | undefined
    >
  )[DEPRECATED_COMMANDS]
  return registry?.get(ctx) ?? []
}

/**
 * Check whether the `deprecated` of a command or an argument marks it as deprecated.
 *
 * @param deprecated - The `deprecated` of a command or an argument
 * @returns `true` for `true` or a text
 */
export function isDeprecated(deprecated: unknown): deprecated is true | string {
  return deprecated === true || typeof deprecated === 'string'
}

/**
 * Render the sentence that tells that a command or an argument is deprecated: the `DEPRECATED` resource with its
 * name, followed by the text of its `deprecated`, which tells what to use instead.
 *
 * @param ctx - A {@link CommandContext | command context}, whose i18n plugin translates the resource
 * @param name - The name of the command or the argument, as the user writes it: `push`, `--format`
 * @param deprecated - The `deprecated` of the command or the argument
 * @returns The sentence: `push is deprecated. Use deploy.`
 */
async function renderDeprecation<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>,
  name: string,
  deprecated: true | string
): Promise<string> {
  const sentence = await localizeBuiltinResource(ctx, DEPRECATED, { name })
  return typeof deprecated === 'string' && deprecated.trim() !== ''
    ? `${sentence} ${deprecated}`
    : sentence
}

/**
 * Render the sentences that tell that the commands on the path of a run are deprecated, root first, one for each:
 * `push is deprecated. Use deploy.`, and `old-remote is deprecated. Use remote.` for a command under the old name
 * of a renamed group.
 *
 * @param ctx - The {@link CommandContext | command context} of the run
 * @returns The sentences, or an empty array
 */
export async function renderDeprecatedCommands<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>
): Promise<string[]> {
  const sentences: string[] = []
  for (const { commandPath, deprecated } of getDeprecatedCommands(ctx)) {
    sentences.push(await renderDeprecation(ctx, commandPath.join(' '), deprecated))
  }
  return sentences
}

/**
 * Render the sentences that tell that the arguments that the user gave are deprecated, in the order of the
 * arguments: `--format is deprecated. Use --output.` for an option, and `<target> is deprecated.` for a positional
 * argument. An argument that only has its default value was not given, and is left out.
 *
 * @param ctx - The {@link CommandContext | command context} of the run
 * @returns The sentences, or an empty array
 */
export async function renderDeprecatedArgs<G extends GunshiParams = DefaultGunshiParams>(
  ctx: CommandContext<G>
): Promise<string[]> {
  const sentences: string[] = []
  for (const [key, schema] of Object.entries(ctx.args) as [string, ArgSchema][]) {
    if (
      !isDeprecated(schema.deprecated) ||
      (ctx.explicit as Record<string, boolean | undefined>)[key] !== true
    ) {
      continue
    }
    const name =
      schema.type === 'positional'
        ? `<${key}>`
        : `--${resolveDisplayName(key, schema, ctx.toKebab)}`
    sentences.push(await renderDeprecation(ctx, name, schema.deprecated))
  }
  return sentences
}
