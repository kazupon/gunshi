/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
  Args,
  ArgSchema,
  Command,
  DefaultGunshiParams,
  ExtendContext,
  ExtractArgs,
  ExtractExtensions,
  GunshiParamsConstraint,
  Prettify,
  SubCommandable
} from '@gunshi/plugin'
import type { CommandResourceFetcher, I18nCommand } from './types.ts'

/**
 * The keys of a definition that an i18n command does not have, mapped to `never`, so that a typo such
 * as `subcommands` is reported at the key (#871). See `UnknownKeys` of `gunshi/definition`.
 *
 * @internal
 */
type UnknownKeys<D, Shape> = { [K in Exclude<keyof D, keyof Shape>]: never }

/**
 * The keys that people write in an argument, from another library or by a typo, with the key of Gunshi to use
 * instead. A copy of `ArgKeyHints` of `gunshi` (`packages/gunshi/src/arg-keys.ts`): change both.
 *
 * @internal
 */
type ArgKeyHints = {
  alias: 'short'
  array: 'multiple'
  desc: 'description'
  require: 'required'
}

/**
 * The message for a key that an argument does not have, with the key to use instead when {@link ArgKeyHints} has
 * one
 *
 * @internal
 */
type UnknownArgKeyMessage<P> =
  `'${P & string}' is not a key of an argument${P extends keyof ArgKeyHints ? `: use '${ArgKeyHints[P]}'` : ''}`

/**
 * The keys of all the members of a union of schemas: `keyof` of a union has only the keys that every member has. See
 * `KeysOfEach` of `gunshi`.
 *
 * @internal
 */
type KeysOfEach<S> = S extends unknown ? keyof S : never

/**
 * The keys of each argument that `ArgSchema` does not have, mapped to a type that names the key, so that the error
 * says which key an argument does not have (#930). See `UnknownArgKeys` of `gunshi`.
 *
 * @internal
 */
type UnknownArgKeys<A> = {
  [K in keyof A]: {
    [P in Exclude<KeysOfEach<A[K]>, keyof ArgSchema | `~gunshi.${string}`>]: {
      [M in UnknownArgKeyMessage<P>]: never
    }
  }
}

/**
 * The result type of the {@linkcode defineI18n} function
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
 * The result type of the {@linkcode withI18nResource} function
 *
 * NOTE(kazupon): a lazy command stays a lazy command, which the CLI calls to load the command, so its
 * result keeps the call signature, which `Prettify` would drop (#877).
 *
 * @internal
 */
type WithI18nResourceResult<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  C extends Command<G> | SubCommandable = Command<G>
> = C extends (...args: any[]) => any
  ? C & { resource: CommandResourceFetcher<G> }
  : Prettify<
      C & { resource: CommandResourceFetcher<G> } & {
        [K in Exclude<keyof I18nCommand<G>, keyof C | 'resource'>]?: I18nCommand<G>[K]
      }
    >

/**
 * Define an i18n-aware {@link I18nCommand | command}.
 *
 * The difference from the {@linkcode define} function is that you can define a `resource` option that can load a locale.
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
 *   resource: locale => {
 *     switch (locale.toString()) {
 *       case 'ja-JP': {
 *         return {
 *           'description': '誰かにあいさつ',
 *           'arg:name': 'あいさつするための名前'
 *         }
 *       }
 *       // other locales ...
 *     }
 *   },
 *   run: ctx => {
 *     console.log(`Hello, ${ctx.values.name}!`)
 *   }
 * })
 * ```
 *
 * @typeParam G - A {@linkcode GunshiParamsConstraint} type
 * @typeParam A - An {@linkcode Args} type extracted from {@linkcode GunshiParamsConstraint}
 * @typeParam C - The inferred command type
 *
 * @param definition - A {@link I18nCommand | command} definition with i18n support
 * @returns A defined {@link I18nCommand | command} with compatible {@linkcode Command} type
 */
export function defineI18n<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  A extends Args = ExtractArgs<G>,
  C = {}
>(
  definition: C & { args?: A } & Omit<
      I18nCommand<{ args: A; extensions: ExtractExtensions<G> }>,
      'resource' | 'args'
    > & {
      resource?: CommandResourceFetcher<{ args: A; extensions: ExtractExtensions<G> }>
    } & UnknownKeys<C, I18nCommand<{ args: A; extensions: ExtractExtensions<G> }>> & {
      args?: UnknownArgKeys<A>
    }
): I18nCommandDefinitionResult<{ args: A; extensions: ExtractExtensions<G> }, C>

/**
 * Define an i18n-aware {@link I18nCommand | command}.
 *
 * @param definition - A {@link I18nCommand | command} definition with i18n support
 * @returns A defined {@link I18nCommand | command} with compatible {@linkcode Command} type
 */
export function defineI18n(definition: any): any {
  return definition
}

/**
 * Return type for {@link defineI18nWithTypes}
 *
 * @typeParam DefaultExtensions - The {@linkcode ExtendContext} type extracted from G
 * @typeParam DefaultArgs - The {@linkcode Args} type extracted from G
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
    > & {
      resource?: CommandResourceFetcher<{ args: A; extensions: DefaultExtensions }>
    } & UnknownKeys<C, I18nCommand<{ args: A; extensions: DefaultExtensions }>> & {
      args?: UnknownArgKeys<A>
    }
) => I18nCommandDefinitionResult<{ args: A; extensions: DefaultExtensions }, C>

/**
 * Define an i18n-aware {@link I18nCommand | command} with types
 *
 * This helper function allows specifying the type parameter of {@linkcode GunshiParams}
 * while inferring the {@linkcode Args} type, {@linkcode ExtendContext} type from the definition.
 *
 * @example
 * ```ts
 * import { defineI18nWithTypes } from '@gunshi/plugin-i18n'
 *
 * // Define a command with specific extensions type
 * type MyExtensions = { logger: { log: (message: string) => void } }
 *
 * const greetCommand = defineI18nWithTypes<{ extensions: MyExtensions }>()({
 *   name: 'greet',
 *   args: {
 *     name: { type: 'string', description: 'Name to greet' }
 *   },
 *   resource: locale => {
 *     switch (locale.toString()) {
 *       case 'ja-JP': {
 *         return {
 *           'description': '誰かにあいさつ',
 *           'arg:name': 'あいさつするための名前'
 *         }
 *       }
 *       // other locales ...
 *     }
 *   },
 *   run: ctx => {
 *     // ctx.values is inferred as { name?: string }
 *     // ctx.extensions is MyExtensions
 *   }
 * })
 * ```
 *
 * @typeParam G - A {@linkcode GunshiParams} type
 *
 * @returns A function that takes a command definition via {@linkcode defineI18n}
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
      > & {
        resource?: CommandResourceFetcher<{ args: A; extensions: DefaultExtensions }>
      } & UnknownKeys<C, I18nCommand<{ args: A; extensions: DefaultExtensions }>> & {
        args?: UnknownArgKeys<A>
      }
  ): I18nCommandDefinitionResult<{ args: A; extensions: DefaultExtensions }, C> => {
    return defineI18n(definition) as any
  }) as DefineI18nWithTypesReturn<DefaultExtensions, DefaultArgs>
}

/**
 * Add i18n resource to an existing command
 *
 * @example
 * ```ts
 * import { define } from 'gunshi'
 * import { withI18nResource } from '@gunshi/plugin-i18n'
 *
 * const myCommand = define({
 *   name: 'myCommand',
 *   args: {
 *     input: { type: 'string', description: 'Input value' }
 *   },
 *   run: ctx => {
 *     console.log(`Input: ${ctx.values.input}`)
 *   }
 * })
 *
 * const i18nCommand = withI18nResource(myCommand, async locale => {
 *   const resource = await import(
 *     `./path/to/resources/test/${locale.toString()}.json`,
 *     { with: { type: 'json' } }
 *   ).then(l => l.default || l)
 *   return resource
 * })
 * ```
 *
 * @param command - A {@link Command | command} defined with {@linkcode define}, or a lazy command defined with `lazy`, which stays a lazy command
 * @param resource - A {@link CommandResourceFetcher | resource fetcher} for the command
 * @returns A {@link I18nCommand | command} with i18n resource support, or a lazy command for a lazy command
 */
export function withI18nResource<
  G extends GunshiParamsConstraint,
  C extends Command<G> | SubCommandable
>(
  // NOTE(kazupon): the command may be a `SubCommandable` (#862), so its keys, such as `commandName`,
  // are known too
  command: C & UnknownKeys<C, I18nCommand<G> & SubCommandable>,
  resource: CommandResourceFetcher<G>
): WithI18nResourceResult<G, C> {
  /**
   * NOTE(kazupon): a lazy command is a function, which the CLI calls to load the command. A copy of its
   * keys into an object loses the loader, and the CLI runs the copy as a command without `run`, which
   * does nothing (#877). So the keys are copied onto a function that calls the lazy command, as the
   * core does when it names a function given as a sub-command. The lazy command is not changed.
   */
  if (typeof command === 'function') {
    return Object.assign((...args: unknown[]) => (command as Function)(...args), command, {
      resource
    }) as unknown as WithI18nResourceResult<G, C>
  }
  return {
    ...command,
    resource
  } as unknown as WithI18nResourceResult<G, C>
}
