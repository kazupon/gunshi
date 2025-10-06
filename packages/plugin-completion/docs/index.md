**@gunshi/plugin-completion**

***

# @gunshi/plugin-completion

The entry point of completion plugin

## Example

```js
import { cli } from 'gunshi'
import completion from '@gunshi/plugin-completion'

const command = {
  name: 'deploy',
  args: {
    environment: {
      type: 'string',
      short: 'e',
      description: 'Target environment'
    },
    config: {
      type: 'string',
      short: 'c',
      description: 'Config file path'
    }
  },
  run: ctx => {
    console.log(`Deploying to ${ctx.values.environment}`)
  }
}

await cli(process.argv.slice(2), command, {
  name: 'my-cli',
  version: '1.0.0',
  plugins: [
    completion({
      config: {
        entry: {
          args: {
            config: {
              handler: () => [
                { value: 'prod.json', description: 'Production config' },
                { value: 'dev.json', description: 'Development config' },
                { value: 'test.json', description: 'Test config' }
              ]
            }
          }
        }
      }
    })
  ]
})
```

## Variables

| Variable | Description |
| ------ | ------ |
| [pluginId](variables/pluginId.md) | The unique identifier for the completion plugin. |

## Functions

| Function | Description |
| ------ | ------ |
| [default](functions/default.md) | completion plugin |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [CompletionConfig](interfaces/CompletionConfig.md) | Completion configuration, which structure is similar `bombsh/tab`'s `CompletionConfig`. |
| [CompletionExtension](interfaces/CompletionExtension.md) | Extended command context which provides utilities via completion plugin. These utilities are available via `CommandContext.extensions['g:completion']`. |
| [CompletionOptions](interfaces/CompletionOptions.md) | Completion plugin options. |
| [CompletionParams](interfaces/CompletionParams.md) | Parameters for [`the completion handler`](type-aliases/CompletionHandler.md). |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [CompletionHandler](type-aliases/CompletionHandler.md) | The handler for completion. |
| [PluginId](type-aliases/PluginId.md) | Type representing the unique identifier for the completion plugin. |
