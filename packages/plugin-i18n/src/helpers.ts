/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Command, DefaultGunshiParams, GunshiParamsConstraint } from '@gunshi/plugin'
import type { CommandResourceFetcher, I18nCommand } from './types.ts'

/**
 * Define an i18n-aware command with type safety
 *
 * @example
 * ```ts
 * import { defineI18n } from '@gunshi/plugin-i18n'
 *
 * const greetCommand = defineI18n({
 *   name: 'greet',
 *   args: {
 *     name: { type: 'string', description: 'Name to greet' }
 *   },
 *   resource: async (ctx) => ({
 *     description: 'Greet someone',
 *     'arg:name': 'The name to greet'
 *   }),
 *   run: async (ctx) => {
 *     console.log(`Hello, ${ctx.values.name}!`)
 *   }
 * })
 * ```
 */
export function defineI18n<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  command: Command<G> & { resource?: CommandResourceFetcher<G> }
): I18nCommand<G> {
  return command
}

/**
 * Add i18n resource to an existing command
 *
 * @example
 * ```ts
 * import { define } from '@gunshi/definition'
 * import { withI18nResource } from '@gunshi/plugin-i18n'
 *
 * const myCommand = define({
 *   name: 'myCommand',
 *   args: {
 *     input: { type: 'string', description: 'Input value' }
 *   },
 *   run: async (ctx) => {
 *     console.log(`Input: ${ctx.values.input}`)
 *   }
 * })
 *
 * const i18nCommand = withI18nResource(basicCommand, async ctx => {
 *   const resource = await import(
 *     `./path/to/resources/test/${ctx.extensions['g:i18n'].locale.toString()}.json`,
 *     { with: { type: 'json' } }
 *   ).then(l => l.default || l)
 *   return resource
 * })
 * ```
 */
export function withI18nResource<G extends GunshiParamsConstraint>(
  command: Command<G>,
  resource: CommandResourceFetcher<G>
): I18nCommand<G> {
  return {
    ...command,
    resource
  }
}
