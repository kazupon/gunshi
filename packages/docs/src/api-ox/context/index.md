# Context

**[Source](https://github.com/kazupon/gunshi/blob/main/context)**

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>2</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>interfaces</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>14</strong>
  <span>members</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>returns</span>
</span>
</div>

## Functions

- [`createCommandContext`](/api-ox/context/functions/createCommandContext.md) `function` `createCommandContext< G extends GunshiParamsConstraint = DefaultGunshiParams, V extends ArgValues<ExtractArgs<G>> = ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = {} >({ args = {} as ExtractArgs<G>, explicit = {} as ExtractArgExplicitlyProvided<G>, values = {} as V, positionals = [], rest = [], argv = [], tokens = [], command = {} as C, extensions = {} as E, cliOptions = {} as CliOptions<G>, callMode = 'entry', commandPath = [], omitted = false, validationError }: CommandContextParams<G, V, C, E>): Promise<CommandContextResult<G, E>>` - Create a command context.

## Interfaces

- [`CommandContextParams`](/api-ox/context/interfaces/CommandContextParams.md) `interface` `CommandContextParams< G extends GunshiParams | { args: Args } | { extensions: ExtendContext }, V extends ArgValues<ExtractArgs<G>>, C extends Command<G> | LazyCommand<G> = Command<G>, E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension> >` - Parameters of createCommandContext
