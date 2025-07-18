[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / I18nCommand

# Interface: I18nCommand\<G\>

I18n-aware command interface that extends the base Command with resource support

## Extends

- `Command`\<`G`\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `G` *extends* `GunshiParamsConstraint` | `DefaultGunshiParams` |

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="args"></a> `args?` | `ExtractArgs`\<`G`\> | Command arguments. Each argument can include a description property to describe the argument in usage. | `Command.args` |
| <a id="description"></a> `description?` | `string` | Command description. It's used to describe the command in usage and it's recommended to specify. | `Command.description` |
| <a id="examples"></a> `examples?` | `string` \| `CommandExamplesFetcher`\<`NormalizeToGunshiParams`\<`G`\>\> | Command examples. examples of how to use the command. | `Command.examples` |
| <a id="name"></a> `name?` | `string` | Command name. It's used to find command line arguments to execute from sub commands, and it's recommended to specify. | `Command.name` |
| <a id="resource"></a> `resource?` | [`CommandResourceFetcher`](../type-aliases/CommandResourceFetcher.md)\<`G`\> | Command resource fetcher for i18n support. This property is specific to i18n-enabled commands. | - |
| <a id="run"></a> `run?` | `CommandRunner`\<`G`\> | Command runner. it's the command to be executed | `Command.run` |
| <a id="tokebab"></a> `toKebab?` | `boolean` | Whether to convert the camel-case style argument name to kebab-case. If you will set to `true`, All Command.args names will be converted to kebab-case. | `Command.toKebab` |
