# Renderer

**[Source](https://github.com/kazupon/gunshi/blob/main/renderer)**

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>3</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>3</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>4</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>3</strong>
  <span>returns</span>
</span>
</div>

## Functions

- [`renderHeader`](/api-ox/renderer/functions/renderHeader.md) `function` `renderHeader<G extends GunshiParams = DefaultGunshiParams>(ctx: Readonly<CommandContext<G>>): Promise<string>` - Render the header.
- [`renderUsage`](/api-ox/renderer/functions/renderUsage.md) `function` `renderUsage<G extends GunshiParams = DefaultGunshiParams>(ctx: Readonly<CommandContext<G>>): Promise<string>` - Render the usage.
- [`renderValidationErrors`](/api-ox/renderer/functions/renderValidationErrors.md) `function` `renderValidationErrors<G extends GunshiParams = DefaultGunshiParams>(_ctx: CommandContext<G>, error: AggregateError): Promise<string>` - Render the validation errors.
