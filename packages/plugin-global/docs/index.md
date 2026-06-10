# API Documentation

The entry point of global options plugin

## Example

```js
import global from '@gunshi/plugin-global'
import { cli } from 'gunshi'

const entry = (ctx) => {
  // ...
}

await cli(process.argv.slice(2), entry, {
  // ...

  plugins: [
    global()
  ],

  // ...
})
```

## Variables

| Variable | Description |
| ------ | ------ |
| [pluginId](/packages/plugin-global/docs/default/variables/pluginId.md) | The unique identifier for the global options plugin. |

## Functions

| Function | Description |
| ------ | ------ |
| [default](/packages/plugin-global/docs/default/functions/default.md) | global options plugin |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [GlobalExtension](/packages/plugin-global/docs/default/interfaces/GlobalExtension.md) | Extended command context which provides utilities via global options plugin. These utilities are available via `CommandContext.extensions['g:global']`. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [PluginId](/packages/plugin-global/docs/default/type-aliases/PluginId.md) | Type representing the unique identifier for the global options plugin. |

