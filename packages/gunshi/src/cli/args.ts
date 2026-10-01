/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { create } from '../utils.ts'

import type { Args, ArgSchema } from '../types.ts'

/**
 * Resolve the arguments of a command, the way gunshi parses and renders them.
 *
 * The global options belong to no command definition, so they are merged into the arguments of the
 * command that runs. An argument of the command shadows the global option of the same name, and it
 * shadows the same way by short name: a global option gives up its short name to an argument of the
 * command that claims the same letter, and keeps its long name.
 *
 * NOTE(kazupon): this is not exported from the entry points. `@gunshi/plugin-completion` completes
 * the arguments the same way with the copy in `@gunshi/shared`, and the tests of that copy pin it
 * to the results of this one, so a change here has to be made there too.
 *
 * @param globalOptions - The global options that plugins registered with `addGlobalOption`
 * @param args - The arguments that the command declares
 * @returns The merged arguments
 */
export function resolveCommandArgs<A extends Args = Args>(
  globalOptions?: ReadonlyMap<string, ArgSchema>,
  args?: A
): A {
  return Object.assign(create<A>(), resolveGlobalOptions(globalOptions, args), args)
}

function resolveGlobalOptions(
  globalOptions: ReadonlyMap<string, ArgSchema> | undefined,
  args: Args | undefined
): Args | undefined {
  if (!globalOptions) {
    return undefined
  }

  const shortNames = new Set<string>()
  for (const schema of Object.values(args || {})) {
    if (schema.type !== 'positional' && schema.short) {
      shortNames.add(schema.short)
    }
  }

  const resolved = create<Args>()
  for (const [name, schema] of globalOptions) {
    /**
     * NOTE(kazupon): a copy, because the schema is the one that the plugin registered, which every
     * command of the CLI shares. Only this command gives up the short name.
     */
    resolved[name] =
      schema.short && shortNames.has(schema.short) ? { ...schema, short: undefined } : schema
  }

  return resolved
}
