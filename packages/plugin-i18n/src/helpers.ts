/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
  Args,
  Command,
  DefaultGunshiParams,
  ExtendContext,
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
 *   resource: ctx => ({
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
 * Return type for defineI18nWithTypes
 *
 * @typeParam DefaultExtensions - The {@link ExtendContext} type extracted from G
 * @typeParam DefaultArgs - The {@link Args} type extracted from G
 *
 * @internal
 */
type DefineI18nWithTypesReturn<
  DefaultExtensions extends ExtendContext,
  DefaultArgs extends Args
> = <A extends DefaultArgs = DefaultArgs, C = {}>(
  definition: C & { args?: A } & Omit<
      I18nCommand<{ args: A; extensions: DefaultExtensions }>,
      'resource' | 'args'
    > & { resource?: CommandResourceFetcher<{ args: A; extensions: DefaultExtensions }> }
) => I18nCommandDefinitionResult<{ args: A; extensions: DefaultExtensions }, C>

/**
 * Define an i18n-aware {@link I18nCommand | command} with types
 *
 * This helper function allows specifying the type parameter of {@link GunshiParams}
 * while inferring the {@link Args} type, {@link ExtendContext} type from the definition.
 *
 * @example
 * ```ts
 * // Define a command with specific extensions type
 * type MyExtensions = { logger: { log: (message: string) => void } }
 *
 * const command = defineI18nWithTypes<{ extensions: MyExtensions }>()({
 *   name: 'greet',
 *   args: {
 *     name: { type: 'string' }
 *   },
 *   resource: ctx => ({
 *     description: 'Greet someone',
 *     'arg:name': 'The name to greet'
 *   }),
 *   run: ctx => {
 *     // ctx.values is inferred as { name?: string }
 *     // ctx.extensions is MyExtensions
 *   }
 * })
 * ```
 *
 * @typeParam G - A {@link GunshiParams} type
 *
 * @returns A function that takes a command definition via {@link defineI18n}
 */
export function defineI18nWithTypes<G extends GunshiParamsConstraint>(): DefineI18nWithTypesReturn<
  ExtractExtensions<G>,
  ExtractArgs<G>
> {
  // Extract extensions from G, with proper defaults
  type DefaultExtensions = ExtractExtensions<G>
  type DefaultArgs = ExtractArgs<G>

  return (<A extends DefaultArgs = DefaultArgs, C = {}>(
    definition: C & { args?: A } & Omit<
        I18nCommand<{ args: A; extensions: DefaultExtensions }>,
        'resource' | 'args'
      > & { resource?: CommandResourceFetcher<{ args: A; extensions: DefaultExtensions }> }
  ): I18nCommandDefinitionResult<{ args: A; extensions: DefaultExtensions }, C> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): defineI18n returns compatible type but TypeScript cannot infer it
    return defineI18n(definition) as any
  }) as DefineI18nWithTypesReturn<DefaultExtensions, DefaultArgs>
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
 *
 * @param command - A defined command with {@link define} function
 * @param resource - A resource fetcher for the command
 * @returns A command with i18n resource support
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
