/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { JSON_ARG } from './constants.ts'

/**
 * The argument that a command spreads into its `args` to support `--json`.
 *
 * A command that spreads it returns its result from `run`, as an object keyed by a noun, and prints
 * the output for people with `ctx.log`. With `--json`, the global options plugin silences `ctx.log`,
 * prints the result as one JSON document to stdout, and prints a failure as one line of JSON to
 * stderr. `--json` given to a command that does not spread it stops the command before it runs, with
 * `json_not_supported`.
 *
 * The `json` argument has a mark, by which gunshi tells it from a `json` argument of the command's
 * own, which gunshi does not touch. To give it a short name, spread it:
 * `{ ...jsonArgs.json, short: 'j' }`. A lazy command spreads it into its definition too.
 *
 * @example
 * ```js
 * import { define, jsonArgs } from 'gunshi'
 *
 * export default define({
 *   name: 'list',
 *   args: { ...jsonArgs },
 *   run: async ctx => {
 *     const projects = await fetchProjects()
 *     for (const project of projects) {
 *       ctx.log(project.name)
 *     }
 *     return { projects }
 *   }
 * })
 * ```
 */
export const jsonArgs = {
  json: { type: 'boolean', description: 'Output the result as JSON', [JSON_ARG]: true }
} as const
