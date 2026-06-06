**@gunshi/plugin-dryrun**

***

# @gunshi/plugin-dryrun

The entry point of dry-run plugin

## Example

```js
import { cli } from 'gunshi'
import dryrun from '@gunshi/plugin-dryrun'

const command = {
  name: 'deploy',
  async run(ctx) {
    const dryRun = ctx.extensions['g:dryrun']

    await dryRun.run(
      async function build() {
        // build artifacts
      },
      {
        message: 'build artifacts'
      }
    )
  }
}

await cli(process.argv.slice(2), command, {
  plugins: [
    dryrun()
  ]
})
```

## Variables

| Variable | Description |
| ------ | ------ |
| [pluginId](variables/pluginId.md) | The unique identifier for dry-run plugin. |

## Functions

| Function | Description |
| ------ | ------ |
| [default](functions/default.md) | dry-run plugin |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [DryRunExtension](interfaces/DryRunExtension.md) | dry-run plugin extension. |
| [DryRunMessage](interfaces/DryRunMessage.md) | dry-run output message option. |
| [DryRunPluginOptions](interfaces/DryRunPluginOptions.md) | dry-run plugin options. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [DryRunOptionsArg](type-aliases/DryRunOptionsArg.md) | dry-run options tuple for `run()` and `wrap()`. |
| [DryRunRunResult](type-aliases/DryRunRunResult.md) | dry-run result option for `run()`. |
| [DryRunWrapResult](type-aliases/DryRunWrapResult.md) | dry-run result option for `wrap()`. |
| [PluginId](type-aliases/PluginId.md) | Type representing the unique identifier for dry-run plugin. |
