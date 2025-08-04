**@gunshi/plugin-global**

***

# @gunshi/plugin-global

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
| [pluginId](variables/pluginId.md) | The unique identifier for the global options plugin. |

## Functions

| Function | Description |
| ------ | ------ |
| [default](functions/default.md) | global options plugin |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [GlobalExtension](interfaces/GlobalExtension.md) | Extended command context which provides utilities via global options plugin. These utilities are available via `CommandContext.extensions['g:global']`. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [PluginId](type-aliases/PluginId.md) | Type representing the unique identifier for the global options plugin. |
