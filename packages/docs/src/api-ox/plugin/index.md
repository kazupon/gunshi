# Plugin

**[Source](https://github.com/kazupon/gunshi/blob/main/plugin)**

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>36</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>4</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>13</strong>
  <span>interfaces</span>
</span>
<span class="ox-api-stat">
  <strong>17</strong>
  <span>types</span>
</span>
<span class="ox-api-stat">
  <strong>2</strong>
  <span>variables</span>
</span>
<span class="ox-api-stat">
  <strong>17</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>88</strong>
  <span>members</span>
</span>
<span class="ox-api-stat">
  <strong>11</strong>
  <span>returns</span>
</span>
<span class="ox-api-stat">
  <strong>3</strong>
  <span>examples</span>
</span>
</div>

## Functions

- [`createCommandContext`](/api-ox/plugin/functions/createCommandContext.md) `function` `createCommandContext< G extends GunshiParamsConstraint = DefaultGunshiParams, V extends ArgValues<ExtractArgs<G>> = ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = {} >({ args = {} as ExtractArgs<G>, explicit = {} as ExtractArgExplicitlyProvided<G>, values = {} as V, positionals = [], rest = [], argv = [], tokens = [], command = {} as C, extensions = {} as E, cliOptions = {} as CliOptions<G>, callMode = 'entry', commandPath = [], omitted = false, validationError }: CommandContextParams<G, V, C, E>): Promise<CommandContextResult<G, E>>` - Create a command context.
- [`plugin`](/api-ox/plugin/functions/plugin.md) `function` `plugin< Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions Id extends string = string, // for plugin id Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies Extension extends {} = {}, // for plugin extension type ResolvedDepExtensions extends GunshiParams = DependencyParams<Deps, Context>, PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension< Extension, ResolvedDepExtensions >, MergedExtensions extends GunshiParams = MergedPluginParams< Id, Deps, Context, Awaited<ReturnType<PluginExt>> > >(options: { id: Id name?: string dependencies?: Deps setup?: ( ctx: Readonly< PluginContext<MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>> > ) => Awaitable<void> extension: PluginExt onExtension?: OnPluginExtension<MergedExtensions> }): PluginWithExtension<Awaited<ReturnType<PluginExt>>>` - Define a plugin with extension compatibility and typed dependency extensions
- [`plugin`](/api-ox/plugin/functions/plugin.md) `function` `plugin< Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions Id extends string = string, // for plugin id Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies Extension extends Record<string, unknown> = {}, // for plugin extension type ResolvedDepExtensions extends GunshiParams = DependencyParams<Deps, Context>, PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension< Extension, ResolvedDepExtensions >, MergedExtensions extends GunshiParams = MergedPluginParams< Id, Deps, Context, Awaited<ReturnType<PluginExt>> > >(options: { id: Id name?: string dependencies?: Deps setup?: ( ctx: Readonly< PluginContext<MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>> > ) => Awaitable<void> onExtension?: OnPluginExtension<MergedExtensions> }): PluginWithoutExtension<DefaultGunshiParams['extensions']>` - Define a plugin without extension and typed dependency extensions
- [`plugin`](/api-ox/plugin/functions/plugin.md) `function` `plugin(options: any = {}): any` - Define a plugin

## Interfaces

- [`Args`](/api-ox/plugin/interfaces/Args.md) `interface` `Args` - An object that contains argument schema. This type is used to define the structure and…
- [`ArgSchema`](/api-ox/plugin/interfaces/ArgSchema.md) `interface` `ArgSchema` - An argument schema definition for command-line argument parsing. This schema is similar…
- [`ArgToken`](/api-ox/plugin/interfaces/ArgToken.md) `interface` `ArgToken` - Argument token.
- [`Command`](/api-ox/plugin/interfaces/Command.md) `interface` `Command<G extends GunshiParamsConstraint = DefaultGunshiParams>` - Command interface.
- [`CommandContext`](/api-ox/plugin/interfaces/CommandContext.md) `interface` `CommandContext<G extends GunshiParamsConstraint = DefaultGunshiParams>` - Command context. Command context is the context of the command execution.
- [`CommandContextExtension`](/api-ox/plugin/interfaces/CommandContextExtension.md) `interface` `CommandContextExtension< E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions'] >` - Command context extension
- [`CommandContextParams`](/api-ox/plugin/interfaces/CommandContextParams.md) `interface` `CommandContextParams< G extends GunshiParams | { args: Args } | { extensions: ExtendContext }, V extends ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension> >` - Parameters of createCommandContext
- [`GunshiParams`](/api-ox/plugin/interfaces/GunshiParams.md) `interface` `GunshiParams< P extends { args?: Args extensions?: ExtendContext } = { args: Args extensions: {} } >` - Gunshi unified parameter type. This type combines both argument definitions and command…
- [`PluginContext`](/api-ox/plugin/interfaces/PluginContext.md) `interface` `PluginContext<G extends GunshiParamsConstraint = DefaultGunshiParams>` - Gunshi plugin context interface.
- [`PluginDependency`](/api-ox/plugin/interfaces/PluginDependency.md) `interface` `PluginDependency` - Plugin dependency definition
- [`PluginOptions`](/api-ox/plugin/interfaces/PluginOptions.md) `interface` `PluginOptions< DepExt extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions Id extends string = string, // for plugin id Deps extends ReadonlyArray<PluginDependency | string> = (PluginDependency | string)[], // for plugin dependencies Ext extends Record<string, unknown> = {}, // for plugin extension type ResolvedDepExt extends GunshiParams = DependencyParams<Deps, DepExt>, PluginExt extends PluginExtension<Ext, ResolvedDepExt> = PluginExtension<Ext, ResolvedDepExt>, MergedExt extends GunshiParams = MergedPluginParams< Id, Deps, DepExt, Awaited<ReturnType<PluginExt>> > >` - Plugin definition options
- [`PluginWithExtension`](/api-ox/plugin/interfaces/PluginWithExtension.md) `interface` `PluginWithExtension< E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions'] > extends Plugin<E>` - Plugin return type with extension, which includes the plugin ID, name, dependencies, an…
- [`PluginWithoutExtension`](/api-ox/plugin/interfaces/PluginWithoutExtension.md) `interface` `PluginWithoutExtension< E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions'] > extends Plugin<E>` - Plugin return type without extension, which includes the plugin ID, name, and dependenc…

## Type Aliases

- [`ArgValues`](/api-ox/plugin/type-aliases/ArgValues.md) `type` `ArgValues<T> = T extends Args ? ResolveArgValues<T, { [Arg in keyof T]: ExtractOptionValue<T[Arg]> }> : { [option: string]: string | boolean | number | (string | boolean | number)[] | undefined; }` - An object that contains the values of the arguments.
- [`Awaitable`](/api-ox/plugin/type-aliases/Awaitable.md) `type` `Awaitable<T> = T | Promise<T>` - Awaitable type.
- [`CommandContextCore`](/api-ox/plugin/type-aliases/CommandContextCore.md) `type` `CommandContextCore<G extends GunshiParamsConstraint = DefaultGunshiParams> = Readonly< CommandContext<G> >` - Readonly command context available to a command context extension factory.
- [`CommandDecorator`](/api-ox/plugin/type-aliases/CommandDecorator.md) `type` `CommandDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = ( baseRunner: (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void> ) => (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void>` - Command decorator. A function that wraps a command runner to add or modify its behavior.
- [`CommandExamplesFetcher`](/api-ox/plugin/type-aliases/CommandExamplesFetcher.md) `type` `CommandExamplesFetcher<G extends GunshiParamsConstraint = DefaultGunshiParams> = ( ctx: Readonly<CommandContext<G>> ) => Awaitable<string>` - Command examples fetcher.
- [`CommandRunner`](/api-ox/plugin/type-aliases/CommandRunner.md) `type` `CommandRunner<G extends GunshiParamsConstraint = DefaultGunshiParams> = ( ctx: Readonly<CommandContext<G>> ) => Awaitable<string | void>` - Command runner.
- [`DefaultGunshiParams`](/api-ox/plugin/type-aliases/DefaultGunshiParams.md) `type` `DefaultGunshiParams = GunshiParams` - Default Gunshi parameters.
- [`ExtendContext`](/api-ox/plugin/type-aliases/ExtendContext.md) `type` `ExtendContext = Record<string, unknown>` - Extend command context type. This type is used to extend the command context with addit…
- [`GunshiParamsConstraint`](/api-ox/plugin/type-aliases/GunshiParamsConstraint.md) `type` `GunshiParamsConstraint = | GunshiParams<any> | { args: Args } | { extensions: ExtendContext }` - Generic constraint for command-related types. This type constraint allows both GunshiPa…
- [`LazyCommand`](/api-ox/plugin/type-aliases/LazyCommand.md) `type` `LazyCommand< G extends GunshiParamsConstraint = DefaultGunshiParams, D extends Partial<Command<G>> = {} > = { /** * Command load function */ (): Awaitable<Command<G> | CommandRunner<G>> } & // If definition has name, commandName is required with that type (D extends { name: infer N } ? { commandName: N } : { commandName?: string }) & // Properties from the definition (if provided inline) Omit<D, 'name' | 'run'> & // Remaining properties from Command (optional) Partial<Omit<Command<G>, keyof D | 'run' | 'name'>>` - Lazy command interface. Lazy command that's not loaded until it is executed.
- [`OnPluginExtension`](/api-ox/plugin/type-aliases/OnPluginExtension.md) `type` `OnPluginExtension<G extends GunshiParams = DefaultGunshiParams> = ( ctx: Readonly<CommandContext<G>>, cmd: Readonly<Command<G>> ) => Awaitable<void>` - Plugin extension callback, which is called when the plugin is extended with extension o…
- [`Plugin`](/api-ox/plugin/type-aliases/Plugin.md) `type` `Plugin<E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']> = PluginFunction & { id: string name?: string dependencies?: (PluginDependency | string)[] extension?: CommandContextExtension<E> }` - Gunshi plugin, which is a function that receives a PluginContext.
- [`PluginExtension`](/api-ox/plugin/type-aliases/PluginExtension.md) `type` `PluginExtension< T = Record<string, unknown>, G extends GunshiParams = DefaultGunshiParams > = (ctx: CommandContextCore<G>, cmd: Command<G>) => Awaitable<T>` - Plugin extension
- [`PluginFunction`](/api-ox/plugin/type-aliases/PluginFunction.md) `type` `PluginFunction<G extends GunshiParams = DefaultGunshiParams> = ( ctx: Readonly<PluginContext<G>> ) => Awaitable<void>` - Plugin function type
- [`Prettify`](/api-ox/plugin/type-aliases/Prettify.md) `type` `Prettify<T> = { [K in keyof T]: T[K] } & {}` - Prettify a type by flattening its structure.
- [`RendererDecorator`](/api-ox/plugin/type-aliases/RendererDecorator.md) `type` `RendererDecorator<T, G extends GunshiParamsConstraint = DefaultGunshiParams> = ( baseRenderer: (ctx: Readonly<CommandContext<G>>) => Promise<T>, ctx: Readonly<CommandContext<G>> ) => Promise<T>` - Renderer decorator type. A function that wraps a base renderer to add or modify its beh…
- [`ValidationErrorsDecorator`](/api-ox/plugin/type-aliases/ValidationErrorsDecorator.md) `type` `ValidationErrorsDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = ( baseRenderer: (ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>, ctx: Readonly<CommandContext<G>>, error: AggregateError ) => Promise<string>` - Validation errors renderer decorator type. A function that wraps a validation errors re…

## Variables

- [`ANONYMOUS_COMMAND_NAME`](/api-ox/plugin/variables/ANONYMOUS_COMMAND_NAME.md) `variable` `const ANONYMOUS_COMMAND_NAME = '(anonymous)'`
- [`CLI_OPTIONS_DEFAULT`](/api-ox/plugin/variables/CLI_OPTIONS_DEFAULT.md) `variable` `const CLI_OPTIONS_DEFAULT: CliOptions<DefaultGunshiParams>`
