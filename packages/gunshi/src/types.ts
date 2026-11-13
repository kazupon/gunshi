/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { JSON_ARG } from './constants.ts'
import type { ArgExplicitlyProvided, ArgSchema, ArgToken, Args, ArgValues } from 'args-tokens'
import type { Plugin } from './plugin/core.ts'

export type { Args, ArgSchema, ArgToken, ArgValues } from 'args-tokens'

/**
 * Awaitable type.
 *
 * @typeParam T - The type of the value that can be awaited.
 */
export type Awaitable<T> = T | Promise<T>

/**
 * Prettify a type by flattening its structure.
 *
 * @typeParam T - The type to be prettified.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {}

/**
 * Extend command context type. This type is used to extend the command context with additional properties at {@linkcode CommandContext.extensions}.
 *
 * @since v0.27.0
 */
export type ExtendContext = Record<string, unknown>

/**
 * Gunshi unified parameter type.
 *
 * This type combines both argument definitions and command context extensions.
 *
 * @typeParam P - The type of parameters, which can include `args` and `extensions`.
 *
 * @since v0.27.0
 */
// #region snippet
export interface GunshiParams<
  P extends {
    args?: Args
    extensions?: ExtendContext
  } = {
    args: Args
    extensions: {}
  }
> {
  /**
   * Command argument definitions.
   */
  args: P extends { args: infer A extends Args } ? A : Args
  /**
   * Command context extensions.
   */
  extensions: P extends { extensions: infer E extends ExtendContext } ? E : {}
}
// #endregion snippet

/**
 * Default Gunshi parameters.
 *
 * @since v0.27.0
 */
export type DefaultGunshiParams = GunshiParams

/**
 * Generic constraint for command-related types.
 *
 * This type constraint allows both {@linkcode GunshiParams} and objects with extensions.
 *
 * @since v0.27.0
 */
export type GunshiParamsConstraint =
  | GunshiParams<any>
  | {
      args: Args
    }
  | {
      extensions: ExtendContext
    }

/**
 * Type helper to extract args
 *
 * @typeParam G - The type of {@linkcode GunshiParams} or an object with {@linkcode Args}.
 *
 * @internal
 */
export type ExtractArgs<G> =
  G extends GunshiParams<any>
    ? G['args']
    : G extends {
          args: infer A extends Args
        }
      ? A
      : Args

/**
 * Type helper to extract explicitly provided argument flags.
 *
 * @typeParam G - The type of {@linkcode GunshiParams}.
 *
 * @internal
 */
export type ExtractArgExplicitlyProvided<G> = ArgExplicitlyProvided<ExtractArgs<G>>

/**
 * Type helper to extract extensions from G
 *
 * @internal
 */
export type ExtractExtensions<G> =
  G extends GunshiParams<any> ? G['extensions'] : G extends { extensions: infer E } ? E : {}

/**
 * Type helper to normalize G to GunshiParams
 *
 * @internal
 */
export type NormalizeToGunshiParams<G> =
  G extends GunshiParams<any>
    ? G
    : G extends { args: infer A extends Args; extensions: infer E extends ExtendContext }
      ? GunshiParams<{ args: A; extensions: E }>
      : G extends { args: infer A extends Args }
        ? GunshiParams<{ args: A; extensions: {} }>
        : G extends { extensions: infer E extends ExtendContext }
          ? GunshiParams<{ args: Args; extensions: E }>
          : DefaultGunshiParams

/**
 * Type helper to merge command context extensions into G
 *
 * @internal
 */
export type MergeGunshiExtensions<
  G extends GunshiParamsConstraint,
  E extends ExtendContext
> = GunshiParams<{
  /**
   * Command argument definitions.
   */
  args: ExtractArgs<G>
  /**
   * Merged command context extensions.
   */
  extensions: ExtractExtensions<G> & E
}>

/**
 * Command environment.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command environments.
 */
export interface CommandEnvironment<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Current working directory.
   *
   * @see {@linkcode CliOptions.cwd}
   */
  cwd: string | undefined
  /**
   * Command name.
   *
   * @see {@linkcode CliOptions.name}
   */
  name: string | undefined
  /**
   * Command description.
   *
   * @see {@linkcode CliOptions.description}
   */
  description: string | undefined
  /**
   * Command version.
   *
   * @see {@linkcode CliOptions.version}
   */
  version: string | undefined
  /**
   * Left margin of the command output.
   *
   * @default 2
   * @see {@linkcode CliOptions.leftMargin}
   */
  leftMargin: number
  /**
   * Middle margin of the command output.
   *
   * @default 10
   * @see {@linkcode CliOptions.middleMargin}
   */
  middleMargin: number
  /**
   * Whether to display the usage option type.
   *
   * @default false
   * @see {@linkcode CliOptions.usageOptionType}
   */
  usageOptionType: boolean
  /**
   * Whether to display the option value.
   *
   * @default true
   * @see {@linkcode CliOptions.usageOptionValue}
   */
  usageOptionValue: boolean
  /**
   * Whether to keep usage, header, version, and validation-error text off the terminal
   * (they are still returned as strings) and to silence {@linkcode CommandContext.log}.
   *
   * Output that must still appear — machine-readable results for an agent, warnings for the
   * CLI author — should use `console.log` / `console.warn`, not `ctx.log`. A command that spreads
   * `jsonArgs` and is given `--json` prints its result, and its errors, as JSON even with it.
   *
   * The validation errors, and a `CommandError` that the command throws, are not printed either, so
   * `cli()` rejects with them, for the caller to report them.
   *
   * @default false
   * @see {@linkcode CliOptions.usageSilent}
   */
  usageSilent: boolean
  /**
   * Whether to treat undefined options as argument validation errors.
   *
   * @default false
   * @see {@linkcode CliOptions.strict}
   */
  strict: boolean
  /**
   * Whether to treat the positional arguments that the command does not take as argument validation errors.
   *
   * @default false
   * @see {@linkcode CliOptions.strictPositionals}
   */
  strictPositionals: boolean
  /**
   * Whether to follow the validation errors with the command that shows the help.
   *
   * @default true
   * @see {@linkcode CliOptions.helpHint}
   */
  helpHint: boolean
  /**
   * The exit code of the validation errors. A command can give it to a `CommandError`, to end an
   * argument error that it finds itself with the same exit code.
   *
   * @default 1
   * @see {@linkcode CliOptions.validationErrorExitCode}
   */
  validationErrorExitCode: number
  /**
   * Sub commands.
   *
   * @see {@linkcode CliOptions.subCommands}
   */
  subCommands: Map<string, Command<any> | LazyCommand<any>> | undefined
  /**
   * The entry command of the CLI, marked with `entry: true`.
   *
   * It is available whether or not the CLI has sub-commands, while {@linkcode CommandEnvironment.subCommands}
   * includes the entry command only when the CLI has sub-commands, given with {@linkcode CliOptions.subCommands}
   * or with {@linkcode Command.subCommands} of the entry command.
   * It is not frozen, like the commands in {@linkcode CommandEnvironment.subCommands}.
   */
  entryCommand?: Command<any> | LazyCommand<any>
  /**
   * The global options that are in effect for the command being executed.
   *
   * A plugin registers a global option with `addGlobalOption`, and gunshi merges it into the arguments
   * of the command that runs. An argument that the command declares under the same name replaces it,
   * and the option is then not in effect: the value under that name is the command's, and the plugin
   * that registered it must not read it as its own.
   *
   * The schema is the one in effect, which may have given up its short name to an argument of the
   * command that claims the same letter.
   */
  globalOptions?: ReadonlyMap<string, ArgSchema>
  /**
   * Render function the command usage.
   */
  renderUsage: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null | undefined
  /**
   * Render function the header section in the command usage.
   */
  renderHeader: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null | undefined
  /**
   * Render function the validation errors.
   */
  renderValidationErrors:
    | ((ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>)
    | null
    | undefined
  /**
   * Hook that runs before any command execution
   *
   * @see {@linkcode CliOptions.onBeforeCommand}
   * @since v0.27.0
   */
  onBeforeCommand: ((ctx: Readonly<CommandContext<G>>) => Awaitable<void>) | undefined
  /**
   * Hook that runs after successful command execution. It receives the result of the command only
   * when it is a string.
   *
   * @see {@linkcode CliOptions.onAfterCommand}
   * @since v0.27.0
   */
  onAfterCommand:
    | ((ctx: Readonly<CommandContext<G>>, result: string | undefined) => Awaitable<void>)
    | undefined
  /**
   * Hook that runs when a command throws an error
   *
   * @see {@linkcode CliOptions.onErrorCommand}
   * @since v0.27.0
   */
  onErrorCommand: ((ctx: Readonly<CommandContext<G>>, error: Error) => Awaitable<void>) | undefined
}

/**
 * CLI options of {@linkcode cli} function.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of cli options.
 */
export interface CliOptions<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Current working directory.
   */
  cwd?: string
  /**
   * Command program name.
   */
  name?: string
  /**
   * Command program description.
   *
   */
  description?: string
  /**
   * Command program version.
   */
  version?: string
  /**
   * Sub commands.
   *
   * An object or a Map keyed by the sub-command names, or an array of commands, which are keyed by their names.
   * A value of the object or the Map may also be a loader, a function that returns the command or its runner,
   * which runs as a lazy command named after its key.
   * When this is not given, the {@linkcode Command.subCommands} of the entry command are the sub-commands.
   */
  subCommands?:
    | Record<string, SubCommandable | SubCommandLoader>
    | Map<string, SubCommandable | SubCommandLoader>
    | readonly SubCommandable[]
  /**
   * Left margin of the command output.
   */
  leftMargin?: number
  /**
   * Middle margin of the command output.
   */
  middleMargin?: number
  /**
   * Whether to display the usage optional argument type.
   */
  usageOptionType?: boolean
  /**
   * Whether to display the optional argument value.
   */
  usageOptionValue?: boolean
  /**
   * Whether to keep usage, header, version, and validation-error text off the terminal
   * (they are still returned as strings) and to silence {@linkcode CommandContext.log}.
   *
   * Output that must still appear — machine-readable results for an agent, warnings for the
   * CLI author — should use `console.log` / `console.warn`, not `ctx.log`. A command that spreads
   * `jsonArgs` and is given `--json` prints its result, and its errors, as JSON even with it.
   *
   * The validation errors, and a `CommandError` that the command throws, are not printed either, so
   * `cli()` rejects with them, for the caller to report them (see
   * {@linkcode CliOptions.renderValidationErrors}). The exit code is left alone.
   *
   * @default false
   */
  usageSilent?: boolean
  /**
   * Whether to treat undefined options as argument validation errors.
   *
   * When enabled, option tokens that are not declared by the resolved command
   * arguments or installed global options are reported as validation errors
   * before the command runner is executed.
   *
   * With the global options plugin, `--help` and `--version` are still answered: given with them, an
   * unknown option is not reported, as the other argument validation errors are not. An unknown command
   * is still reported.
   *
   * `--json` is not reported, since gunshi knows what it means: given to a command that does not
   * spread `jsonArgs`, the global options plugin reports `json_not_supported` for it instead, with or
   * without `strict`. `--json=false` asks for no JSON, and is reported.
   *
   * @default false
   */
  strict?: boolean
  /**
   * Whether to treat the positional arguments that the command does not take as argument validation
   * errors, as `strict` does for the options.
   *
   * When enabled, the positional arguments after the command path that the positional arguments of the
   * resolved command do not take are reported as validation errors before the command runner is
   * executed. A command takes as many as it declares, an optional one included, and any number with a
   * positional argument with `multiple: true`. The arguments after `--` are not positional arguments:
   * they stay in `rest`.
   *
   * With the global options plugin, `--help` and `--version` are still answered, as they are with the
   * other argument validation errors. After a command with sub-commands, a word that is not one of them
   * is reported as an unknown command instead.
   *
   * @default false
   */
  strictPositionals?: boolean
  /**
   * Render function the command usage.
   */
  renderUsage?: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null
  /**
   * Render function the header section in the command usage.
   */
  renderHeader?: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null
  /**
   * Render function the validation errors.
   *
   * With the global options plugin, the rendered message is printed to stderr, the exit code is set
   * to {@linkcode CliOptions.validationErrorExitCode}, `1` by default,
   * {@linkcode CliOptions.onErrorCommand} is called, and `cli()` resolves with `undefined`.
   * The message is followed by the command that shows the help, unless {@linkcode CliOptions.helpHint}
   * is `false`.
   * Set it to `null` to report the validation errors yourself: nothing is printed, and `cli()` rejects
   * with the `AggregateError`. A renderer that returns an empty message, and
   * {@linkcode CliOptions.usageSilent}, also leave them to the caller.
   *
   * With `--json`, the plugin prints the validation errors as one line of JSON, and does not call
   * the renderer. `null` and {@linkcode CliOptions.usageSilent} still leave them to the caller.
   */
  renderValidationErrors?:
    | ((ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>)
    | null
  /**
   * Whether to follow the validation errors with the command that shows the help of the nearest
   * command: the command itself for an argument error, and the parent of an unknown command, such as
   * `my-app deploy --help`. With the global options plugin, it is printed to stderr after the errors,
   * after an empty line and a heading. It is the command that `next` of the JSON error has with
   * `--json`.
   *
   * Set it to `false` to leave the command out, such as when your renderer of the validation errors
   * points to the help in its own way. It changes the output for people only: `next` of the JSON error
   * stays. The command is left out for a command whose `--help` does not show the help, too: one that
   * declares a `help` argument of its own, or with `renderUsage: null`.
   *
   * @default true
   */
  helpHint?: boolean
  /**
   * The exit code of the validation errors, such as `2`, the exit code of a usage error in many
   * command-line tools. They are the errors of the arguments: a missing or invalid argument, an unknown
   * command or a command line that cannot be resolved, an unknown option, only with `strict`, a
   * positional argument that the command does not take, only with `strictPositionals`, and `--json`
   * given to a command that does not spread `jsonArgs`. Without `strict`, an unknown option is ignored
   * and the command runs, so to end it with this exit code too, give `strict: true` as well. With the
   * global options plugin, the exit code is set to it when the errors are printed, as text or as JSON,
   * before {@linkcode CliOptions.onErrorCommand} is called, which can still change it.
   *
   * It is an integer from `1` to `255`, as the `exitCode` of a `CommandError` is, and any other value is
   * replaced with `1`. It does not change the exit code of a `CommandError`, nor of any other error that a
   * command throws. With `renderValidationErrors: null`, a renderer that returns an empty message, or
   * {@linkcode CliOptions.usageSilent}, nothing is printed, and the exit code is left alone.
   *
   * @default 1
   */
  validationErrorExitCode?: number
  /**
   * Whether to fallback to entry command when the sub-command is not found.
   *
   * When it is not set, it is `true` for a CLI that declares no sub-commands and to which a plugin adds
   * commands, such as the `complete` command of `@gunshi/plugin-completion`, so that the positional
   * arguments of the entry command are not taken for command names. This is so when the entry command
   * has something to run: a command object with `run`, a lazy command, whose loader gives the runner,
   * or a runner given to `cli()`. For a command object without `run`, it stays `false`: the commands of
   * the plugins are then the commands of the CLI, and an argument that is not one of them is reported.
   *
   * @default false
   * @since v0.27.0
   */
  fallbackToEntry?: boolean
  /**
   * User plugins.
   *
   * @since v0.27.0
   */
  plugins?: Plugin[]
  /**
   * Hook that runs before any command execution
   *
   * @param ctx - The command context
   * @since v0.27.0
   */
  onBeforeCommand?: (ctx: Readonly<CommandContext<G>>) => Awaitable<void>
  /**
   * Hook that runs after successful command execution
   *
   * @param ctx - The command context
   * @param result - The result of the command, when it is a string. The result of a command that
   * prints JSON with `--json` is printed, not passed, so it is `undefined`
   * @since v0.27.0
   */
  onAfterCommand?: (ctx: Readonly<CommandContext<G>>, result: string | undefined) => Awaitable<void>
  /**
   * Hook that runs when a command throws an error, or when the arguments fail validation
   *
   * For the validation errors and a `CommandError` that the global options plugin has printed, the
   * exit code is already set when the hook runs ({@linkcode CliOptions.validationErrorExitCode} for the
   * validation errors, and the `exitCode` of a `CommandError`), so the hook can set another one, and
   * `cli()` resolves after it. Any other error rejects `cli()` after the hook.
   *
   * @param ctx - The command context
   * @param error - The error thrown during execution, or the `AggregateError` of the validation errors
   * @since v0.27.0
   */
  onErrorCommand?: (ctx: Readonly<CommandContext<G>>, error: Error) => Awaitable<void>
}

/**
 * Command call mode.
 *
 * - `entry`: The command is executed as an entry command.
 * - `subCommand`: The command is executed as a sub-command.
 */
export type CommandCallMode = 'entry' | 'subCommand' | 'unexpected'

/**
 * Command context.
 *
 * Command context is the context of the command execution.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command context.
 */
export interface CommandContext<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Command name, that is the command that is executed.
   * The command name is same {@linkcode CommandEnvironment.name}.
   */
  name: string | undefined
  /**
   * Command description, that is the description of the command that is executed.
   * The command description is same {@linkcode CommandEnvironment.description}.
   */
  description: string | undefined
  /**
   * Command environment, that is the environment of the command that is executed.
   * The command environment is same {@linkcode CommandEnvironment}.
   */
  env: Readonly<CommandEnvironment<G>>
  /**
   * Command arguments, that is the arguments of the command that is executed.
   * The command arguments is same {@linkcode Command.args}.
   */
  args: ExtractArgs<G>

  /**
   * Whether arguments were explicitly provided by the user.
   *
   * - `true`: The argument was explicitly provided via command line
   * - `false`: The argument was not explicitly provided. This means either:
   *   - The value comes from a default value defined in the argument schema
   *   - The value is `undefined` (no explicit input and no default value)
   */
  explicit: ExtractArgExplicitlyProvided<G>

  /**
   * Command values, that is the values of the command that is executed.
   * Resolve values with `resolveArgs` from command arguments and {@linkcode Command.args}.
   */
  values: ArgValues<ExtractArgs<G>>
  /**
   * The positional arguments of the command line, the names of the command path first: `app deploy web`
   * gives `['deploy', 'web']`. The positional arguments of the command itself are
   * `positionals.slice(commandPath.length)`, and the ones that it declares are in `values` too.
   */
  positionals: string[]
  /**
   * Command rest arguments, that is the remaining argument not resolved by the optional command option delimiter `--`.
   */
  rest: string[]
  /**
   * Original command line arguments.
   * This argument is passed from `cli` function.
   */
  _: string[]
  /**
   * Argument tokens, that is parsed by `parseArgs` function.
   */
  tokens: ArgToken[]
  /**
   * Whether the currently executing command has been executed with the sub-command name omitted.
   *
   * A command that has sub-commands and no {@linkcode Command.run | run} prints its usage then, with
   * the global options plugin, as `--help` does.
   */
  omitted: boolean
  /**
   * Command call mode.
   * The command call mode is `entry` when the command is executed as an entry command, and `subCommand` when the command is executed as a sub-command.
   */
  callMode: CommandCallMode
  /**
   * The path of nested sub-commands that were resolved to reach the current command.
   *
   * For example, if the user runs `git remote add`, `commandPath` would be `['remote', 'add']`.
   * For the entry command, this is an empty array.
   *
   * @since v0.28.0
   */
  commandPath: string[]
  /**
   * Whether to convert the camel-case style argument name to kebab-case.
   * This context value is set from {@linkcode Command.toKebab} option.
   */
  toKebab?: boolean
  /**
   * Output a message for people.
   *
   * If {@linkcode CommandEnvironment.usageSilent} is true, the message is not output. Nor is it when a
   * command that spreads `jsonArgs` is asked for JSON with `--json`, so that stdout has the JSON only:
   * the hooks and the plugins get the same function.
   *
   * @param message - an output message, see {@linkcode console.log}
   * @param optionalParams - an optional parameters, see {@linkcode console.log}
   */
  log: (message?: any, ...optionalParams: any[]) => void
  /**
   * Command context extensions.
   *
   * @since v0.27.0
   */
  extensions: keyof ExtractExtensions<G> extends never ? any : ExtractExtensions<G>
  /**
   * Validation error from argument parsing.
   * This will be set if argument validation fails during CLI execution.
   */
  validationError?: AggregateError
}

/**
 * Readonly command context available to a command context extension factory.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command context.
 *
 * @since v0.27.0
 */
export type CommandContextCore<G extends GunshiParamsConstraint = DefaultGunshiParams> = Readonly<
  CommandContext<G>
>

/**
 * Command context extension
 *
 * @typeParam E - A type extending {@linkcode GunshiParams.extensions} to specify the shape of the extension.
 *
 * @since v0.27.0
 */
export interface CommandContextExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> {
  /**
   * Plugin identifier
   */
  readonly key: symbol
  /**
   * Plugin extension factory
   */
  readonly factory: (ctx: CommandContextCore, cmd: Command) => Awaitable<E>
  /**
   * Plugin extension factory after hook
   */
  readonly onFactory?: (ctx: Readonly<CommandContext>, cmd: Readonly<Command>) => Awaitable<void>
}

/**
 * Rendering control options
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of render options.
 *
 * @since v0.27.0
 */
export interface RenderingOptions<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Header rendering configuration
   * - `null`: Disable rendering
   * - `function`: Use custom renderer
   * - `undefined` (when omitted): Use default renderer
   */
  header?: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null

  /**
   * Usage rendering configuration
   * - `null`: Disable rendering
   * - `function`: Use custom renderer
   * - `undefined` (when omitted): Use default renderer
   */
  usage?: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null

  /**
   * Validation errors rendering configuration
   * - `null`: Disable rendering. `cli()` rejects with the validation errors, for the caller to report them
   * - `function`: Use custom renderer
   * - `undefined` (when omitted): Use default renderer
   *
   * See {@linkcode CliOptions.renderValidationErrors} for where the rendered message goes.
   */
  validationErrors?:
    | ((ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>)
    | null
}

/**
 * Command interface.
 *
 * @typeParam G - The Gunshi parameters constraint
 */
export interface Command<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Command name.
   * It's used to find command line arguments to execute from sub commands, and it's recommended to specify.
   */
  name?: string
  /**
   * Command description.
   * It's used to describe the command in usage and it's recommended to specify.
   */
  description?: string
  /**
   * Command arguments.
   * Each argument can include a description property to describe the argument in usage.
   */
  args?: ExtractArgs<G>
  /**
   * Command examples.
   * examples of how to use the command.
   */
  examples?: string | CommandExamplesFetcher<G>
  /**
   * Command runner. it's the command to be executed
   *
   * A command that has sub-commands needs no runner: run without a sub-command, it prints its usage,
   * with the global options plugin, as `--help` does. A command with a runner runs it then, with
   * {@linkcode CommandContext.omitted | omitted} set to `true`.
   *
   * A command without sub-commands needs a runner. Without one, it throws a `TypeError` when it runs
   * (`'run' is required in command: <name>`), and `--help` still prints its usage. So does a lazy command
   * whose loader returns a command without a runner.
   */
  run?: CommandRunner<G>
  /**
   * Whether to convert the camel-case style argument name to kebab-case.
   * If you will set to `true`, All {@linkcode Command.args} names will be converted to kebab-case.
   */
  toKebab?: boolean
  /**
   * Whether this is an internal command.
   * Internal commands are not shown in help usage.
   *
   * @default false
   * @since v0.27.0
   */
  internal?: boolean
  /**
   * Other names of the command, such as `['ls']` for `list`.
   *
   * The command runs with any of them, as with its name, and `ctx.name` and `ctx.commandPath` have its name:
   * the help, the hints and the help as JSON tell the name of the command. An alias is accepted but not taught:
   * the help does not list it, and the `Did you mean` hint for an unknown command and shell completion do not
   * offer it.
   *
   * A sub-command whose name is the alias wins over the alias, so an alias never hides a command. Two commands
   * at the same level with the same alias are a mistake: using the alias throws a `TypeError`. A lazy command
   * takes its aliases from the definition given to `lazy`, as it is found before it is loaded.
   */
  aliases?: readonly string[]
  /**
   * Whether the command is deprecated: `true`, or the text that tells what to use instead, such as `'Use deploy.'`.
   *
   * A deprecated command still runs. With the global options plugin, it prints a warning to stderr when it runs,
   * once: `push is deprecated. Use deploy.`, and not when the command is asked for JSON with `--json`. A command
   * under a deprecated group, such as the old name of a renamed group, warns of the group too. Its help says that
   * it is deprecated, after its description. As an internal command, it is left out of the help, the
   * `Did you mean` hint for an unknown command, shell completion and the help as JSON, so that they teach what to
   * use instead.
   *
   * To rename a command, keep the old name as a deprecated command that runs as the new one, such as
   * `push: define({ ...deploy, name: 'push', aliases: [], deprecated: 'Use deploy.' })`, where `aliases: []` takes
   * the aliases that the spread copies off the old name. It has no effect on the entry command.
   */
  deprecated?: boolean | string
  /**
   * Whether this command is an entry command.
   *
   * @default undefined
   * @since v0.27.0
   */
  entry?: boolean
  /**
   * Rendering control options
   *
   * @since v0.27.0
   */
  rendering?: RenderingOptions<G>
  /**
   * Nested sub-commands for this command.
   *
   * Allows building command trees like `git remote add`.
   * Each key is the sub-command name, and the value is a command, a lazy command, or a loader, a function that
   * returns the command or its runner, which runs as a lazy command named after its key.
   * An array of commands is keyed by the names of the commands.
   *
   * On the entry command, these are the top-level sub-commands when {@linkcode CliOptions.subCommands} is not given.
   *
   * @since v0.28.0
   */
  subCommands?:
    | Record<string, SubCommandable | SubCommandLoader>
    | Map<string, SubCommandable | SubCommandLoader>
    | readonly SubCommandable[]
}

/**
 * Lazy command interface.
 *
 * Lazy command that's not loaded until it is executed.
 *
 * @typeParam G - The Gunshi parameters constraint
 * @typeParam D - The partial command definition provided to lazy function
 */
export type LazyCommand<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  D extends Partial<Command<G>> = {}
> = {
  /**
   * Command load function
   */
  (): Awaitable<Command<G> | CommandRunner<G>>
} &
  // If definition has name, commandName is required with that type
  (D extends { name: infer N } ? { commandName: N } : { commandName?: string }) &
  // Properties from the definition (if provided inline)
  Omit<D, 'name' | 'run'> &
  // Remaining properties from Command (optional)
  Partial<Omit<Command<G>, keyof D | 'run' | 'name'>>

/**
 * Define a command type.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command.
 */
export type Commandable<G extends GunshiParamsConstraint = DefaultGunshiParams> =
  | Command<G>
  | LazyCommand<G, {}>

/**
 * A function given as a sub-command, which the CLI loads as a lazy command named after its key:
 * it returns the command, or its runner
 *
 * @internal
 */
type SubCommandLoader = () => Awaitable<SubCommandable | ((...args: any[]) => any)>

/**
 * Sub-command entry type for use in subCommands.
 *
 * This type uses a loose structural match to bypass TypeScript's contravariance issues
 * with function parameters, allowing any Command or LazyCommand to be used as a sub-command.
 *
 * @since v0.27.1
 */
export interface SubCommandable {
  /**
   * see {@link Command.name}
   */
  name?: string
  /**
   * see {@link Command.description}
   */
  description?: string
  /**
   * see {@link Command.args}
   */
  args?: Args | Record<string, any>
  /**
   * see {@link Command.examples}
   */
  examples?: string | ((...args: any[]) => any)
  /**
   * see {@link Command.run}
   */
  run?: (...args: any[]) => any
  /**
   * see {@link Command.toKebab}
   */
  toKebab?: boolean
  /**
   * see {@link Command.internal}
   */
  internal?: boolean
  /**
   * see {@link Command.aliases}
   */
  aliases?: readonly string[]
  /**
   * see {@link Command.deprecated}
   */
  deprecated?: boolean | string
  /**
   * see {@link Command.entry}
   */
  entry?: boolean
  /**
   * see {@link Command.rendering}
   */
  rendering?: any
  /**
   * see {@link LazyCommand.commandName}
   */
  commandName?: string
  /**
   * Nested sub-commands for this command.
   *
   * @see {@link Command.subCommands}
   * @since v0.28.0
   */
  subCommands?: Record<string, any> | Map<string, any> | readonly any[]
}

/**
 * Command examples fetcher.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command context.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A fetched command examples.
 */
export type CommandExamplesFetcher<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<string>

/**
 * Command runner.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command context.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns The result of a command that spreads `jsonArgs`, an object keyed by a noun, which is printed
 * as JSON with `--json`. For any other command, a string, which `cli()` returns, or nothing. See
 * {@linkcode CommandRunnerResult}.
 */
export type CommandRunner<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => CommandRunnerResult<G>

/**
 * The result of a command that supports `--json`: an object keyed by a noun, such as
 * `{ project }` or `{ projects }`, so that fields can be added later. The global options plugin prints
 * it with `JSON.stringify`, so convert what JSON cannot hold, such as a `Map` or a `BigInt`, yourself.
 */
export type JsonResult = Record<string, unknown>

/**
 * Whether the arguments have the `json` of `jsonArgs`.
 *
 * @typeParam A - The arguments of a command
 */
export type HasJsonArgs<A> = [A] extends [{ readonly json: { readonly [JSON_ARG]: true } }]
  ? true
  : false

/**
 * What the runner of a command returns: its result for a command that spreads `jsonArgs`, otherwise a string or
 * nothing.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams}
 */
export type CommandRunnerResult<G extends GunshiParamsConstraint = DefaultGunshiParams> =
  IsAnyArgs<ExtractArgs<G>> extends true
    ? Awaitable<string | void | JsonResult>
    : HasJsonArgs<ExtractArgs<G>> extends true
      ? Awaitable<JsonResult>
      : Awaitable<string | void>

/**
 * Whether the arguments are `any`, as in `CommandRunner<any>`. Then a runner may return anything it could before.
 *
 * @internal
 */
type IsAnyArgs<A> = 0 extends 1 & A ? true : false

/**
 * Command loader.
 *
 * A function that returns a command or command runner.
 * This is used to lazily load commands.
 *
 * Any other value, such as `null` or `undefined`, fails with `Cannot resolve command: <name>`. To tell
 * what went wrong, such as a module that is not found, throw an error instead, such as a
 * `CommandError`. An error of the loading is thrown where the command would run, as an error of
 * `run` is: a `CommandError` prints its message with its exit code, `--json` prints the failure as JSON,
 * and `onErrorCommand` sees it. Until then, the definition given to `lazy` stands for the command, so that
 * `--help` prints its usage.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command context and command runner.
 *
 * @returns A command or command runner
 */
export type CommandLoader<G extends GunshiParamsConstraint = DefaultGunshiParams> = () => Awaitable<
  Command<G> | CommandRunner<G>
>

/**
 * Command decorator.
 *
 * A function that wraps a command runner to add or modify its behavior.
 *
 * The decorated runner returns what the base runner returns, as it is: the result of a command that
 * spreads `jsonArgs` must reach the global options plugin, which prints it as JSON with `--json`. A
 * decorator prints with `ctx.log`, which is silenced then.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command context.
 *
 * @param baseRunner - The base command runner to decorate
 * @returns The decorated command runner
 *
 * @since v0.27.0
 */
export type CommandDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRunner: (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void | JsonResult>
) => (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void | JsonResult>

/**
 * Renderer decorator type.
 *
 * A function that wraps a base renderer to add or modify its behavior.
 *
 * @typeParam T - The type of the rendered result.
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command context.
 *
 * @param baseRenderer - The base renderer function to decorate
 * @param ctx - The command context
 * @returns The decorated result
 *
 * @since v0.27.0
 */
export type RendererDecorator<T, G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>) => Promise<T>,
  ctx: Readonly<CommandContext<G>>
) => Promise<T>

/**
 * Validation errors renderer decorator type.
 * A function that wraps a validation errors renderer to add or modify its behavior.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command context.
 *
 * @param baseRenderer - The base validation errors renderer function to decorate
 * @param ctx - The command context
 * @param error - The aggregate error containing validation errors
 * @returns The decorated result
 *
 * @since v0.27.0
 */
export type ValidationErrorsDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>,
  ctx: Readonly<CommandContext<G>>,
  error: AggregateError
) => Promise<string>
