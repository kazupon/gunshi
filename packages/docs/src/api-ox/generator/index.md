# Generator

**[Source](https://github.com/kazupon/gunshi/blob/main/generator)**

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
  <span>types</span>
</span>
<span class="ox-api-stat">
  <strong>3</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>returns</span>
</span>
</div>

## Functions

- [`generate`](/api-ox/generator/functions/generate.md) `function` `generate<G extends GunshiParamsConstraint = DefaultGunshiParams>(command: string | string[] | null, entry: Command<G> | LazyCommand<G>, options: GenerateOptions<G> = {}): Promise<string>` - Generate the command usage.

## Type Aliases

- [`GenerateOptions`](/api-ox/generator/type-aliases/GenerateOptions.md) `type` `GenerateOptions<G extends GunshiParamsConstraint = DefaultGunshiParams> = CliOptions<G>` - generate options of generate function.
