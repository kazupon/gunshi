# Generator

The entry for usage generator.

**[Source](https://github.com/kazupon/gunshi/blob/main/generator)**

_2 symbols · 1 functions · 1 types · 3 parameters · 1 returns_

## Functions

- [`generate`](/api-ox/generator/functions/generate.md) `function` `generate<G extends GunshiParamsConstraint = DefaultGunshiParams>(command: string | string[] | null, entry: Command<G> | LazyCommand<G>, options: GenerateOptions<G> = {}): Promise<string>` - Generate the command usage.

## Type Aliases

- [`GenerateOptions`](/api-ox/generator/type-aliases/GenerateOptions.md) `type` `GenerateOptions<G extends GunshiParamsConstraint = DefaultGunshiParams> = CliOptions<G>` - generate options of generate function.
