# API Documentation

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
| [pluginId](/packages/plugin-dryrun/docs/default/variables/pluginId.md) | The unique identifier for dry-run plugin. |

## Functions

| Function | Description |
| ------ | ------ |
| [default](/packages/plugin-dryrun/docs/default/functions/default.md) | dry-run plugin |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [DryRunExtension](/packages/plugin-dryrun/docs/default/interfaces/DryRunExtension.md) | dry-run plugin extension. |
| [DryRunMessage](/packages/plugin-dryrun/docs/default/interfaces/DryRunMessage.md) | dry-run output message option. |
| [DryRunPluginOptions](/packages/plugin-dryrun/docs/default/interfaces/DryRunPluginOptions.md) | dry-run plugin options. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [DryRunOptionsArg](/packages/plugin-dryrun/docs/default/type-aliases/DryRunOptionsArg.md) | dry-run options tuple for `run()` and `wrap()`. |
| [DryRunRunResult](/packages/plugin-dryrun/docs/default/type-aliases/DryRunRunResult.md) | dry-run result option for `run()`. |
| [DryRunWrapResult](/packages/plugin-dryrun/docs/default/type-aliases/DryRunWrapResult.md) | dry-run result option for `wrap()`. |
| [PluginId](/packages/plugin-dryrun/docs/default/type-aliases/PluginId.md) | Type representing the unique identifier for dry-run plugin. |

