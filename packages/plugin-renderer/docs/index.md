**@gunshi/plugin-renderer**

***

# @gunshi/plugin-renderer

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

## Functions

| Function | Description |
| ------ | ------ |
| [default](functions/default.md) | usage renderer plugin |
| [renderHeader](functions/renderHeader.md) | Render the header. |
| [renderUsage](functions/renderUsage.md) | Render the usage. |
| [renderValidationErrors](functions/renderValidationErrors.md) | Render the validation errors. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [UsageRendererCommandContext](interfaces/UsageRendererCommandContext.md) | Extended command context which provides utilities via usage renderer plugin. These utilities are available via `CommandContext.extensions['g:renderer']`. |
