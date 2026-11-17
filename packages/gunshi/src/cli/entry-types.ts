/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args, Awaitable, JsonResult, SubCommandable } from '../types.ts'

/**
 * `G`, which a call does not infer from: an indexed access that waits for `G`, as `NoInfer` of TypeScript 5.4 does
 *
 * NOTE(kazupon): the first overload of `cli()` infers the arguments of the entry command from its `args`, and takes
 * `G` as `{ args: A; extensions: {} }` (#931). If `G` were inferred, a command of `define()` would give it from the
 * keys that the definition does not write, which `define()` types with the default parameters, such as `examples`, and
 * a command that spreads `jsonArgs` would not fit. Nor is the entry typed as `Command<{ args: A; extensions: {} }>`:
 * as the first overload, that breaks the inference of `define()` written in the call (#452).
 *
 * @typeParam G - The type of the parameters of a command
 *
 * @internal
 */
export type NoInferParams<G> = [G][G extends unknown ? 0 : never]

/**
 * A command that the other overloads of `cli()` do not take, such as a command of another copy of the types of gunshi:
 * its arguments are `Args`, and its runner returns what a runner returns
 *
 * NOTE(kazupon): `gunshi` and `@gunshi/definition` bundle their own copies of the types. A command of `define()` types
 * its `run` with the context of its arguments, and the keys that the definition does not write with the default
 * parameters. Within one copy, TypeScript compares them by the variance of `CommandContext`, and the command fits;
 * across the copies, TypeScript compares the structures, and the command fits no other overload. So the runner takes
 * any arguments here. The arguments are `Args`, and the runner returns what a runner returns, so that an object written
 * in the call with an argument that is not valid, such as `type: 'numbr'`, is a type error, rather than taken with a
 * `ctx` of `any` (#931).
 *
 * @internal
 */
export type EntryCommandable = Omit<SubCommandable, 'args' | 'run'> & {
  args?: Args
  run?: (...args: any[]) => Awaitable<string | void | JsonResult>
}
