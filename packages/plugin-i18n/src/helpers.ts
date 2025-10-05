/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
  Args,
  Command,
  DefaultGunshiParams,
  ExtractArgs,
  ExtractExtensions,
  GunshiParamsConstraint,
  Prettify
} from '@gunshi/plugin'
import type { CommandResourceFetcher, I18nCommand } from './types.ts'

/**
 * The result type of the {@link defineI18n} function
 *
 * @internal
 */
type I18nCommandDefinitionResult<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  C = {}
> = Prettify<
  Omit<C, 'resource'> &
    ('resource' extends keyof C
      ? { resource: CommandResourceFetcher<G> }
      : { resource?: CommandResourceFetcher<G> | undefined }) & {
      [K in Exclude<keyof I18nCommand<G>, keyof C | 'resource'>]?: I18nCommand<G>[K]
    }
>

/**
 * Define an i18n-aware {@link I18nCommand | command}.
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
 *
 * @typeParam G - A {@link GunshiParamsConstraint} type
 * @typeParam A - An {@link Args} type extracted from {@link GunshiParamsConstraint}
 * @typeParam C - The inferred command type
 *
 * @param definition - A {@link I18nCommand | command} definition with i18n support
 * @returns A defined {@link I18nCommand | command} with compatible {@link Command} type
 */
export function defineI18n<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  A extends Args = ExtractArgs<G>,
  C = {}
>(
  definition: C & { args?: A } & Omit<
      I18nCommand<{ args: A; extensions: ExtractExtensions<G> }>,
      'resource' | 'args'
    > & { resource?: any } // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): for implementation
): I18nCommandDefinitionResult<{ args: A; extensions: ExtractExtensions<G> }, C>

/**
 * Define a {@link I18nCommand | command}.
 *
 * @typeParam G - A {@link GunshiParamsConstraint} type
 *
 * @param definition - A {@link I18nCommand | command} definition
 * @returns A defined {@link I18nCommand | command}
 */
export function defineI18n(
  definition: any // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): for implementation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): for implementation
): any {
  return definition
}

/**
 * Add i18n resource to an existing command
 *
 * @param command - A defined command with `define` function
 * @param resource - A resource fetcher for the command
 * @returns A command with i18n resource support
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
