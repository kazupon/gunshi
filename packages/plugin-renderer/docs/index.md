# API Documentation

The entry point of usage renderer plugin

## Example

```js
import renderer from '@gunshi/plugin-renderer'
import { cli } from 'gunshi'

const entry = (ctx) => {
  // ...
}

await cli(process.argv.slice(2), entry, {
  // ...

  plugins: [
    renderer()
  ],

  // ...
})
```

## Variables

| Variable | Description |
| ------ | ------ |
| [pluginId](/packages/plugin-renderer/docs/default/variables/pluginId.md) | The unique identifier for usage renderer plugin. |

## Functions

| Function | Description |
| ------ | ------ |
| [default](/packages/plugin-renderer/docs/default/functions/default.md) | usage renderer plugin |
| [renderHeader](/packages/plugin-renderer/docs/default/functions/renderHeader.md) | Render the header. |
| [renderUsage](/packages/plugin-renderer/docs/default/functions/renderUsage.md) | Render the usage. |
| [renderValidationErrors](/packages/plugin-renderer/docs/default/functions/renderValidationErrors.md) | Render the validation errors. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [UsageRendererExtension](/packages/plugin-renderer/docs/default/interfaces/UsageRendererExtension.md) | Extended command context which provides utilities via usage renderer plugin. These utilities are available via `CommandContext.extensions['g:renderer']`. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [PluginId](/packages/plugin-renderer/docs/default/type-aliases/PluginId.md) | Type representing the unique identifier for usage renderer plugin. |

