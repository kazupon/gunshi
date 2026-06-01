# Renderer

The entry point for Gunshi renderer.

**[Source](https://github.com/kazupon/gunshi/blob/main/renderer)**

_3 symbols · 3 functions · 4 parameters · 3 returns_

## Functions

- [`renderHeader`](/api-ox/renderer/functions/renderHeader.md) `function` `renderHeader<G extends GunshiParams = DefaultGunshiParams>(ctx: Readonly<CommandContext<G>>): Promise<string>` - Render the header.
- [`renderUsage`](/api-ox/renderer/functions/renderUsage.md) `function` `renderUsage<G extends GunshiParams = DefaultGunshiParams>(ctx: Readonly<CommandContext<G>>): Promise<string>` - Render the usage.
- [`renderValidationErrors`](/api-ox/renderer/functions/renderValidationErrors.md) `function` `renderValidationErrors<G extends GunshiParams = DefaultGunshiParams>(_ctx: CommandContext<G>, error: AggregateError): Promise<string>` - Render the validation errors.
