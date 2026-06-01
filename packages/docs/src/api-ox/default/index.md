# Default

gunshi cli entry point.

This entry point exports the bellow APIs and types:

- `cli`: The main CLI function to run the command, included `global options` and `usage renderer` built-in plugins.
- `define`: A function to define a command.
- `defineWithTypes`: A function to define a command with specific type parameters.
- `lazy`: A function to lazily load a command.
- `lazyWithTypes`: A function to lazily load a command with specific type parameters.
- `plugin`: A function to create a plugin.
- `createCommandContext`: A function to create a command context, mainly for testing purposes.
- `args-tokens` utilities, `parseArgs` and `resolveArgs` for parsing command line arguments.
- Some basic type definitions, such as `CommandContext`, `Plugin`, `PluginContext`, etc.

**[Source](https://github.com/kazupon/gunshi/blob/main/default)**

_58 symbols · 19 functions · 1 classes · 17 interfaces · 20 types · 1 variables · 48 parameters · 141 members · 27 returns · 10 examples_

## Functions

- [`cli`](/api-ox/default/functions/cli.md) `function` `cli<G extends GunshiParamsConstraint>(args: string[], entry: Command<G> | CommandRunner<G> | LazyCommand<G>, options?: CliOptions<G>): Promise<string | undefined>` - Run the command.
- [`cli`](/api-ox/default/functions/cli.md) `function` `cli< A extends Args = Args, G extends GunshiParams = { args: A; extensions: {} } >(args: string[], entry: Command<G> | CommandRunner<G> | LazyCommand<G>, options?: CliOptions<G>): Promise<string | undefined>` - Run the command.
- [`cli`](/api-ox/default/functions/cli.md) `function` `cli< E extends ExtendContext = ExtendContext, G extends GunshiParams = { args: Args; extensions: E } >(args: string[], entry: Command<G> | CommandRunner<G> | LazyCommand<G>, options?: CliOptions<G>): Promise<string | undefined>` - Run the command.
- [`cli`](/api-ox/default/functions/cli.md) `function` `cli<G extends GunshiParams = DefaultGunshiParams>(args: string[], entry: Command<G> | CommandRunner<G> | LazyCommand<G>, options?: CliOptions<G>): Promise<string | undefined>` - Run the command.
- [`cli`](/api-ox/default/functions/cli.md) `function` `cli(args: string[], entry: SubCommandable, options?: CliOptions): Promise<string | undefined>` - Run the command. This overload accepts any command-like object using a loose structural…
- [`cli`](/api-ox/default/functions/cli.md) `function` `cli<G extends GunshiParams = DefaultGunshiParams>(args: string[], entry: Command<G> | CommandRunner<G> | LazyCommand<G>, options: CliOptions<G> = {}): Promise<string | undefined>` - Run the command.
- [`createCommandContext`](/api-ox/default/functions/createCommandContext.md) `function` `createCommandContext< G extends GunshiParamsConstraint = DefaultGunshiParams, V extends ArgValues<ExtractArgs<G>> = ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = {} >({ args = {} as ExtractArgs<G>, explicit = {} as ExtractArgExplicitlyProvided<G>, values = {} as V, positionals = [], rest = [], argv = [], tokens = [], command = {} as C, extensions = {} as E, cliOptions = {} as CliOptions<G>, callMode = 'entry', commandPath = [], omitted = false, validationError }: CommandContextParams<G, V, C, E>): Promise<CommandContextResult<G, E>>` - Create a command context.
- [`define`](/api-ox/default/functions/define.md) `function` `define< G extends GunshiParamsConstraint = DefaultGunshiParams, A extends Args = ExtractArgs<G>, C extends Partial<Command<{ args: A; extensions: ExtractExtensions<G> }>> = {} >(definition: CommandDefinition<A, ExtractExtensions<G>, C>): CommandDefinitionResult<G, C>` - Define a command.
- [`define`](/api-ox/default/functions/define.md) `function` `define(definition: any): any` - Define a command.
- [`defineWithTypes`](/api-ox/default/functions/defineWithTypes.md) `function` `defineWithTypes<G extends GunshiParamsConstraint>(): DefineWithTypesReturn< ExtractExtensions<G>, ExtractArgs<G> >` - Define a command with types This helper function allows specifying the type parameter o…
- [`lazy`](/api-ox/default/functions/lazy.md) `function` `lazy<A extends Args>(loader: CommandLoader<{ args: A; extensions: {} }>): LazyCommand<{ args: A; extensions: {} }, {}>` - Define a lazy command.
- [`lazy`](/api-ox/default/functions/lazy.md) `function` `lazy< G extends GunshiParamsConstraint = DefaultGunshiParams, A extends ExtractArgs<G> = ExtractArgs<G>, D extends Partial<Command<{ args: A; extensions: {} }>> = Partial< Command<{ args: A; extensions: {} }> > >(loader: CommandLoader<{ args: A; extensions: {} }>, definition: D): LazyCommand<{ args: A; extensions: {} }, D>` - Define a lazy command with definition.
- [`lazy`](/api-ox/default/functions/lazy.md) `function` `lazy<G extends GunshiParamsConstraint = DefaultGunshiParams>(loader: CommandLoader<G>, definition?: Partial<Command<G>>): LazyCommand<G, any>` - Define a lazy command with or without definition.
- [`lazyWithTypes`](/api-ox/default/functions/lazyWithTypes.md) `function` `lazyWithTypes<G extends GunshiParamsConstraint>(): LazyWithTypesReturn< NormalizeToGunshiParams<G> >` - Define a lazy command with specific type parameters. This helper function allows specif…
- [`parseArgs`](/api-ox/default/functions/parseArgs.md) `function` `parseArgs(args: string[], options?: ParserOptions): ArgToken[]` - Parse command line arguments.
- [`plugin`](/api-ox/default/functions/plugin.md) `function` `plugin< Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions Id extends string = string, // for plugin id Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies Extension extends {} = {}, // for plugin extension type ResolvedDepExtensions extends GunshiParams = DependencyParams<Deps, Context>, PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension< Extension, ResolvedDepExtensions >, MergedExtensions extends GunshiParams = MergedPluginParams< Id, Deps, Context, Awaited<ReturnType<PluginExt>> > >(options: { id: Id name?: string dependencies?: Deps setup?: ( ctx: Readonly< PluginContext<MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>> > ) => Awaitable<void> extension: PluginExt onExtension?: OnPluginExtension<MergedExtensions> }): PluginWithExtension<Awaited<ReturnType<PluginExt>>>` - Define a plugin with extension compatibility and typed dependency extensions
- [`plugin`](/api-ox/default/functions/plugin.md) `function` `plugin< Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions Id extends string = string, // for plugin id Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies Extension extends Record<string, unknown> = {}, // for plugin extension type ResolvedDepExtensions extends GunshiParams = DependencyParams<Deps, Context>, PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension< Extension, ResolvedDepExtensions >, MergedExtensions extends GunshiParams = MergedPluginParams< Id, Deps, Context, Awaited<ReturnType<PluginExt>> > >(options: { id: Id name?: string dependencies?: Deps setup?: ( ctx: Readonly< PluginContext<MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>> > ) => Awaitable<void> onExtension?: OnPluginExtension<MergedExtensions> }): PluginWithoutExtension<DefaultGunshiParams['extensions']>` - Define a plugin without extension and typed dependency extensions
- [`plugin`](/api-ox/default/functions/plugin.md) `function` `plugin(options: any = {}): any` - Define a plugin
- [`resolveArgs`](/api-ox/default/functions/resolveArgs.md) `function` `resolveArgs<A extends Args>(args: A, tokens: ArgToken[], { shortGrouping, skipPositional, toKebab }?: ResolveArgs): { values: ArgValues<A>; positionals: string[]; rest: string[]; error: AggregateError | undefined; explicit: ArgExplicitlyProvided<A>; }` - Resolve command line arguments.

## Classes

- [`DefaultTranslation`](/api-ox/default/classes/DefaultTranslation.md) `class` `DefaultTranslation implements TranslationAdapter` - Default implementation of TranslationAdapter.

## Interfaces

- [`Args`](/api-ox/default/interfaces/Args.md) `interface` `Args` - An object that contains argument schema. This type is used to define the structure and…
- [`ArgSchema`](/api-ox/default/interfaces/ArgSchema.md) `interface` `ArgSchema` - An argument schema definition for command-line argument parsing. This schema is similar…
- [`ArgToken`](/api-ox/default/interfaces/ArgToken.md) `interface` `ArgToken` - Argument token.
- [`CliOptions`](/api-ox/default/interfaces/CliOptions.md) `interface` `CliOptions<G extends GunshiParamsConstraint = DefaultGunshiParams>` - CLI options of cli function.
- [`Command`](/api-ox/default/interfaces/Command.md) `interface` `Command<G extends GunshiParamsConstraint = DefaultGunshiParams>` - Command interface.
- [`CommandContext`](/api-ox/default/interfaces/CommandContext.md) `interface` `CommandContext<G extends GunshiParamsConstraint = DefaultGunshiParams>` - Command context. Command context is the context of the command execution.
- [`CommandContextExtension`](/api-ox/default/interfaces/CommandContextExtension.md) `interface` `CommandContextExtension< E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions'] >` - Command context extension
- [`CommandContextParams`](/api-ox/default/interfaces/CommandContextParams.md) `interface` `CommandContextParams< G extends GunshiParams | { args: Args } | { extensions: ExtendContext }, V extends ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension> >` - Parameters of createCommandContext
- [`CommandEnvironment`](/api-ox/default/interfaces/CommandEnvironment.md) `interface` `CommandEnvironment<G extends GunshiParamsConstraint = DefaultGunshiParams>` - Command environment.
- [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) `interface` `GunshiParams< P extends { args?: Args extensions?: ExtendContext } = { args: Args extensions: {} } >` - Gunshi unified parameter type. This type combines both argument definitions and command…
- [`PluginContext`](/api-ox/default/interfaces/PluginContext.md) `interface` `PluginContext<G extends GunshiParamsConstraint = DefaultGunshiParams>` - Gunshi plugin context interface.
- [`PluginDependency`](/api-ox/default/interfaces/PluginDependency.md) `interface` `PluginDependency` - Plugin dependency definition
- [`PluginOptions`](/api-ox/default/interfaces/PluginOptions.md) `interface` `PluginOptions< DepExt extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions Id extends string = string, // for plugin id Deps extends ReadonlyArray<PluginDependency | string> = (PluginDependency | string)[], // for plugin dependencies Ext extends Record<string, unknown> = {}, // for plugin extension type ResolvedDepExt extends GunshiParams = DependencyParams<Deps, DepExt>, PluginExt extends PluginExtension<Ext, ResolvedDepExt> = PluginExtension<Ext, ResolvedDepExt>, MergedExt extends GunshiParams = MergedPluginParams< Id, Deps, DepExt, Awaited<ReturnType<PluginExt>> > >` - Plugin definition options
- [`PluginWithExtension`](/api-ox/default/interfaces/PluginWithExtension.md) `interface` `PluginWithExtension< E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions'] > extends Plugin<E>` - Plugin return type with extension, which includes the plugin ID, name, dependencies, an…
- [`PluginWithoutExtension`](/api-ox/default/interfaces/PluginWithoutExtension.md) `interface` `PluginWithoutExtension< E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions'] > extends Plugin<E>` - Plugin return type without extension, which includes the plugin ID, name, and dependenc…
- [`RenderingOptions`](/api-ox/default/interfaces/RenderingOptions.md) `interface` `RenderingOptions<G extends GunshiParamsConstraint = DefaultGunshiParams>` - Rendering control options
- [`SubCommandable`](/api-ox/default/interfaces/SubCommandable.md) `interface` `SubCommandable` - Sub-command entry type for use in subCommands. This type uses a loose structural match…

## Type Aliases

- [`ArgValues`](/api-ox/default/type-aliases/ArgValues.md) `type` `ArgValues<T> = T extends Args ? ResolveArgValues<T, { [Arg in keyof T]: ExtractOptionValue<T[Arg]> }> : { [option: string]: string | boolean | number | (string | boolean | number)[] | undefined; }` - An object that contains the values of the arguments.
- [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md) `type` `Awaitable<T> = T | Promise<T>` - Awaitable type.
- [`Commandable`](/api-ox/default/type-aliases/Commandable.md) `type` `Commandable<G extends GunshiParamsConstraint = DefaultGunshiParams> = | Command<G> | LazyCommand<G, {}>` - Define a command type.
- [`CommandCallMode`](/api-ox/default/type-aliases/CommandCallMode.md) `type` `CommandCallMode = 'entry' | 'subCommand' | 'unexpected'` - Command call mode. - entry: The command is executed as an entry command. - subCommand:…
- [`CommandContextCore`](/api-ox/default/type-aliases/CommandContextCore.md) `type` `CommandContextCore<G extends GunshiParamsConstraint = DefaultGunshiParams> = Readonly< CommandContext<G> >` - Readonly command context available to a command context extension factory.
- [`CommandDecorator`](/api-ox/default/type-aliases/CommandDecorator.md) `type` `CommandDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = ( baseRunner: (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void> ) => (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void>` - Command decorator. A function that wraps a command runner to add or modify its behavior.
- [`CommandExamplesFetcher`](/api-ox/default/type-aliases/CommandExamplesFetcher.md) `type` `CommandExamplesFetcher<G extends GunshiParamsConstraint = DefaultGunshiParams> = ( ctx: Readonly<CommandContext<G>> ) => Awaitable<string>` - Command examples fetcher.
- [`CommandLoader`](/api-ox/default/type-aliases/CommandLoader.md) `type` `CommandLoader<G extends GunshiParamsConstraint = DefaultGunshiParams> = () => Awaitable< Command<G> | CommandRunner<G> >` - Command loader. A function that returns a command or command runner. This is used to la…
- [`CommandRunner`](/api-ox/default/type-aliases/CommandRunner.md) `type` `CommandRunner<G extends GunshiParamsConstraint = DefaultGunshiParams> = ( ctx: Readonly<CommandContext<G>> ) => Awaitable<string | void>` - Command runner.
- [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) `type` `DefaultGunshiParams = GunshiParams` - Default Gunshi parameters.
- [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md) `type` `ExtendContext = Record<string, unknown>` - Extend command context type. This type is used to extend the command context with addit…
- [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) `type` `GunshiParamsConstraint = | GunshiParams<any> | { args: Args } | { extensions: ExtendContext }` - Generic constraint for command-related types. This type constraint allows both GunshiPa…
- [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md) `type` `LazyCommand< G extends GunshiParamsConstraint = DefaultGunshiParams, D extends Partial<Command<G>> = {} > = { /** * Command load function */ (): Awaitable<Command<G> | CommandRunner<G>> } & // If definition has name, commandName is required with that type (D extends { name: infer N } ? { commandName: N } : { commandName?: string }) & // Properties from the definition (if provided inline) Omit<D, 'name' | 'run'> & // Remaining properties from Command (optional) Partial<Omit<Command<G>, keyof D | 'run' | 'name'>>` - Lazy command interface. Lazy command that's not loaded until it is executed.
- [`OnPluginExtension`](/api-ox/default/type-aliases/OnPluginExtension.md) `type` `OnPluginExtension<G extends GunshiParams = DefaultGunshiParams> = ( ctx: Readonly<CommandContext<G>>, cmd: Readonly<Command<G>> ) => Awaitable<void>` - Plugin extension callback, which is called when the plugin is extended with extension o…
- [`Plugin`](/api-ox/default/type-aliases/Plugin.md) `type` `Plugin<E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']> = PluginFunction & { id: string name?: string dependencies?: (PluginDependency | string)[] extension?: CommandContextExtension<E> }` - Gunshi plugin, which is a function that receives a PluginContext.
- [`PluginExtension`](/api-ox/default/type-aliases/PluginExtension.md) `type` `PluginExtension< T = Record<string, unknown>, G extends GunshiParams = DefaultGunshiParams > = (ctx: CommandContextCore<G>, cmd: Command<G>) => Awaitable<T>` - Plugin extension
- [`PluginFunction`](/api-ox/default/type-aliases/PluginFunction.md) `type` `PluginFunction<G extends GunshiParams = DefaultGunshiParams> = ( ctx: Readonly<PluginContext<G>> ) => Awaitable<void>` - Plugin function type
- [`Prettify`](/api-ox/default/type-aliases/Prettify.md) `type` `Prettify<T> = { [K in keyof T]: T[K] } & {}` - Prettify a type by flattening its structure.
- [`RendererDecorator`](/api-ox/default/type-aliases/RendererDecorator.md) `type` `RendererDecorator<T, G extends GunshiParamsConstraint = DefaultGunshiParams> = ( baseRenderer: (ctx: Readonly<CommandContext<G>>) => Promise<T>, ctx: Readonly<CommandContext<G>> ) => Promise<T>` - Renderer decorator type. A function that wraps a base renderer to add or modify its beh…
- [`ValidationErrorsDecorator`](/api-ox/default/type-aliases/ValidationErrorsDecorator.md) `type` `ValidationErrorsDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = ( baseRenderer: (ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>, ctx: Readonly<CommandContext<G>>, error: AggregateError ) => Promise<string>` - Validation errors renderer decorator type. A function that wraps a validation errors re…

## Variables

- [`ANONYMOUS_COMMAND_NAME`](/api-ox/default/variables/ANONYMOUS_COMMAND_NAME.md) `variable` `const ANONYMOUS_COMMAND_NAME = '(anonymous)'`
