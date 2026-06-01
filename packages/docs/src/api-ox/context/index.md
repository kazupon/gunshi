# Context

The entry for gunshi context.
This module is exported for the purpose of testing the command.

**[Source](https://github.com/kazupon/gunshi/blob/main/context)**

_2 symbols · 1 functions · 1 interfaces · 1 parameters · 14 members · 1 returns_

## Functions

- [`createCommandContext`](/api-ox/context/functions/createCommandContext.md) `function` `createCommandContext< G extends GunshiParamsConstraint = DefaultGunshiParams, V extends ArgValues<ExtractArgs<G>> = ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = {} >({ args = {} as ExtractArgs<G>, explicit = {} as ExtractArgExplicitlyProvided<G>, values = {} as V, positionals = [], rest = [], argv = [], tokens = [], command = {} as C, extensions = {} as E, cliOptions = {} as CliOptions<G>, callMode = 'entry', commandPath = [], omitted = false, validationError }: CommandContextParams<G, V, C, E>): Promise<CommandContextResult<G, E>>` - Create a command context.

## Interfaces

- [`CommandContextParams`](/api-ox/context/interfaces/CommandContextParams.md) `interface` `CommandContextParams< G extends GunshiParams | { args: Args } | { extensions: ExtendContext }, V extends ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension> >` - Parameters of createCommandContext
