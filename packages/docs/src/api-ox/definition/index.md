# Definition

**[Source](https://github.com/kazupon/gunshi/blob/main/definition)**

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>19</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>8</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>5</strong>
  <span>interfaces</span>
</span>
<span class="ox-api-stat">
  <strong>6</strong>
  <span>types</span>
</span>
<span class="ox-api-stat">
  <strong>9</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>38</strong>
  <span>members</span>
</span>
<span class="ox-api-stat">
  <strong>10</strong>
  <span>returns</span>
</span>
<span class="ox-api-stat">
  <strong>8</strong>
  <span>examples</span>
</span>
</div>

## Functions

- [`createCommandContext`](/api-ox/definition/functions/createCommandContext.md) `function` `createCommandContext< G extends GunshiParamsConstraint = DefaultGunshiParams, V extends ArgValues<ExtractArgs<G>> = ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = {} >({ args = {} as ExtractArgs<G>, explicit = {} as ExtractArgExplicitlyProvided<G>, values = {} as V, positionals = [], rest = [], argv = [], tokens = [], command = {} as C, extensions = {} as E, cliOptions = {} as CliOptions<G>, callMode = 'entry', commandPath = [], omitted = false, validationError }: CommandContextParams<G, V, C, E>): Promise<CommandContextResult<G, E>>` - Create a command context.
- [`define`](/api-ox/definition/functions/define.md) `function` `define< G extends GunshiParamsConstraint = DefaultGunshiParams, A extends Args = ExtractArgs<G>, C extends Partial<Command<{ args: A; extensions: ExtractExtensions<G> }>> = {} >(definition: CommandDefinition<A, ExtractExtensions<G>, C>): CommandDefinitionResult<G, C>` - Define a command.
- [`define`](/api-ox/definition/functions/define.md) `function` `define(definition: any): any` - Define a command.
- [`defineWithTypes`](/api-ox/definition/functions/defineWithTypes.md) `function` `defineWithTypes<G extends GunshiParamsConstraint>(): DefineWithTypesReturn< ExtractExtensions<G>, ExtractArgs<G> >` - Define a command with types This helper function allows specifying the type parameter o…
- [`lazy`](/api-ox/definition/functions/lazy.md) `function` `lazy<A extends Args>(loader: CommandLoader<{ args: A; extensions: {} }>): LazyCommand<{ args: A; extensions: {} }, {}>` - Define a lazy command.
- [`lazy`](/api-ox/definition/functions/lazy.md) `function` `lazy< G extends GunshiParamsConstraint = DefaultGunshiParams, A extends ExtractArgs<G> = ExtractArgs<G>, D extends Partial<Command<{ args: A; extensions: {} }>> = Partial< Command<{ args: A; extensions: {} }> > >(loader: CommandLoader<{ args: A; extensions: {} }>, definition: D): LazyCommand<{ args: A; extensions: {} }, D>` - Define a lazy command with definition.
- [`lazy`](/api-ox/definition/functions/lazy.md) `function` `lazy<G extends GunshiParamsConstraint = DefaultGunshiParams>(loader: CommandLoader<G>, definition?: Partial<Command<G>>): LazyCommand<G, any>` - Define a lazy command with or without definition.
- [`lazyWithTypes`](/api-ox/definition/functions/lazyWithTypes.md) `function` `lazyWithTypes<G extends GunshiParamsConstraint>(): LazyWithTypesReturn< NormalizeToGunshiParams<G> >` - Define a lazy command with specific type parameters. This helper function allows specif…

## Interfaces

- [`Args`](/api-ox/definition/interfaces/Args.md) `interface` `Args` - An object that contains argument schema. This type is used to define the structure and…
- [`ArgSchema`](/api-ox/definition/interfaces/ArgSchema.md) `interface` `ArgSchema` - An argument schema definition for command-line argument parsing. This schema is similar…
- [`Command`](/api-ox/definition/interfaces/Command.md) `interface` `Command<G extends GunshiParamsConstraint = DefaultGunshiParams>` - Command interface.
- [`CommandContextParams`](/api-ox/definition/interfaces/CommandContextParams.md) `interface` `CommandContextParams< G extends GunshiParams | { args: Args } | { extensions: ExtendContext }, V extends ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension> >` - Parameters of createCommandContext
- [`GunshiParams`](/api-ox/definition/interfaces/GunshiParams.md) `interface` `GunshiParams< P extends { args?: Args extensions?: ExtendContext } = { args: Args extensions: {} } >` - Gunshi unified parameter type. This type combines both argument definitions and command…

## Type Aliases

- [`ArgValues`](/api-ox/definition/type-aliases/ArgValues.md) `type` `ArgValues<T> = T extends Args ? ResolveArgValues<T, { [Arg in keyof T]: ExtractOptionValue<T[Arg]> }> : { [option: string]: string | boolean | number | (string | boolean | number)[] | undefined; }` - An object that contains the values of the arguments.
- [`CommandLoader`](/api-ox/definition/type-aliases/CommandLoader.md) `type` `CommandLoader<G extends GunshiParamsConstraint = DefaultGunshiParams> = () => Awaitable< Command<G> | CommandRunner<G> >` - Command loader. A function that returns a command or command runner. This is used to la…
- [`CommandRunner`](/api-ox/definition/type-aliases/CommandRunner.md) `type` `CommandRunner<G extends GunshiParamsConstraint = DefaultGunshiParams> = ( ctx: Readonly<CommandContext<G>> ) => Awaitable<string | void>` - Command runner.
- [`DefaultGunshiParams`](/api-ox/definition/type-aliases/DefaultGunshiParams.md) `type` `DefaultGunshiParams = GunshiParams` - Default Gunshi parameters.
- [`ExtendContext`](/api-ox/definition/type-aliases/ExtendContext.md) `type` `ExtendContext = Record<string, unknown>` - Extend command context type. This type is used to extend the command context with addit…
- [`LazyCommand`](/api-ox/definition/type-aliases/LazyCommand.md) `type` `LazyCommand< G extends GunshiParamsConstraint = DefaultGunshiParams, D extends Partial<Command<G>> = {} > = { /** * Command load function */ (): Awaitable<Command<G> | CommandRunner<G>> } & // If definition has name, commandName is required with that type (D extends { name: infer N } ? { commandName: N } : { commandName?: string }) & // Properties from the definition (if provided inline) Omit<D, 'name' | 'run'> & // Remaining properties from Command (optional) Partial<Omit<Command<G>, keyof D | 'run' | 'name'>>` - Lazy command interface. Lazy command that's not loaded until it is executed.
