# Startup benchmark

Measures how long small CLIs built with gunshi take to start with two builds of gunshi, a base and a head, and tells how much the startup changed. The workflow [`startup-benchmark.yml`](../../.github/workflows/startup-benchmark.yml) runs it on the pull requests to `main`, and comments the results on the pull request.

## What it measures

[`cases.mjs`](./cases.mjs) lists the cases: a CLI of [`fixtures/`](./fixtures) and the arguments it is run with.

| Case                                  | CLI                                                                                            | Arguments        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| A command                             | `command.mjs`: one command with three options                                                  | (none)           |
| A command, `--help`                   | `command.mjs`                                                                                  | `--help`         |
| A command, `--version`                | `command.mjs`                                                                                  | `--version`      |
| 5 sub-commands, `--help`              | `subcommands.mjs`: five sub-commands, which the help lists and sorts                           | `--help`         |
| 5 sub-commands, `build`               | `subcommands.mjs`                                                                              | `build`          |
| i18n and completion plugins           | `plugins.mjs`: `@gunshi/plugin-i18n` with `@gunshi/resources`, and `@gunshi/plugin-completion` | (none)           |
| i18n and completion plugins, `--help` | `plugins.mjs`                                                                                  | `--help`         |
| A completion request                  | `plugins.mjs`                                                                                  | `complete -- --` |
| `gunshi/definition` and `gunshi`      | `definition.mjs`: commands defined with `gunshi/definition`, and run by `cli()` of `gunshi`    | `build`          |
| `@gunshi/bone`                        | `bone.mjs`: a command run by `@gunshi/bone`                                                    | (none)           |

Each case is measured over Node.js alone, which runs an empty script (`fixtures/empty.mjs`).

## How the numbers are made

- **CPU time and wall time** ([`bench.mjs`](./bench.mjs), [`cpu-hook.mjs`](./cpu-hook.mjs)): each run is a process of its own. The CPU time is the user and system time that the process reports when it exits (`process.cpuUsage()`); it moves less than the wall time on a busy machine, which also counts the waits for a CPU.
- **In turns**: every round runs each case with both builds, base first on even rounds and head first on odd ones, and Node.js alone once. The first 3 rounds are not counted.
- **The change** of a case is the median of the differences head − base within a round, with its 99% interval by bootstrap. The bootstrap is seeded, so the same samples give the same interval.
- **Two stages**: every case runs 40 times. A case whose CPU time changed by 0.5 ms or more, with an interval that leaves out 0, runs 100 times more, and is marked when those runs show such a change again. With ten cases at once, one stage would mark a case by chance now and then.
- **What each case loads** ([`inspect.mjs`](./inspect.mjs), [`inspect-hook.mjs`](./inspect-hook.mjs)): each case runs once more with each build, with hooks that record the modules that it loads, with their bytes, and its uses of the ICU services (the `Intl` constructors, `localeCompare` and the `toLocale*String` methods). These do not depend on the machine.

## Run it locally

From the root of a checkout of gunshi, the head, with the base in a worktree:

```sh
# build the head, without the docs
pnpm install
pnpm --recursive --filter '!@gunshi/docs' build

# build the base, here main
git worktree add --detach ../gunshi-base main
(cd ../gunshi-base && pnpm install && pnpm --recursive --filter '!@gunshi/docs' build)

# make a place for each build, then measure them
node bench/startup/setup.mjs ../gunshi-base /tmp/startup/base
node bench/startup/setup.mjs . /tmp/startup/head
node bench/startup/inspect.mjs --out /tmp/startup/inspect.json base=/tmp/startup/base head=/tmp/startup/head
node bench/startup/bench.mjs --out /tmp/startup/timing.json base=/tmp/startup/base head=/tmp/startup/head
node bench/startup/render.mjs --timing /tmp/startup/timing.json --inspect /tmp/startup/inspect.json > /tmp/startup/comment.md
```

- `setup.mjs <checkout> <place>` makes a place whose `node_modules` links to the packages of the built checkout, and copies `fixtures/` there. It makes again a place that it made before, and does not touch a directory that it did not make, unless the directory is empty.
- `bench.mjs` takes `--runs` (40), `--confirm` (100), `--warmup` (3), `--threshold` (0.5 ms), `--only <id,...>` to measure some cases only, and `--base-sha` and `--head-sha` for the comment. It writes the progress to stderr, and the samples and the statistics as JSON.
- To see the noise of your machine, compare a build with itself: make a second place of the same checkout, and give it as the head. No case should be marked.
- A busy machine widens the intervals. Measure when nothing heavy runs.
- Building again a checkout that was built before can fail on a missing `lib/index.d.ts`, since the packages are built in parallel and one removes its `lib` while another reads it. Run the build again.

## In CI

- The workflow runs on a pull request to `main` that changes `packages/` (but not `packages/docs/`), `bench/startup/`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` or the workflow, with Node.js 24 on `ubuntu-24.04`.
- It checks out the base of the pull request and the head (the merge commit), builds both in the same job, and measures them with the scripts of the head. The runner, and its CPU, may differ from run to run, so only the base and the head of the same run are compared.
- It writes the comment to the summary of the run, and uploads `timing.json`, `inspect.json` and `comment.md` as the artifact `startup-benchmark`. On a pull request from a branch of this repository, it creates the comment on the pull request, or updates the one that it wrote before. A pull request from a fork has a read-only token, so its results stay in the summary of the run.
- It does not fail when the startup gets slower. It fails when a build or a script fails.
- To run it by hand, use `workflow_dispatch`, for example `gh workflow run startup-benchmark.yml --ref <branch> -f base=<ref>`. With `base` left empty, the head is compared with itself, which shows the noise of the runner.

## Reading the comment

- The first line tells the cases that changed by 0.5 ms or more, if any.
- The table shows, for each case, the CPU time over Node.js alone with the base and the head (the medians), and the change with its 99% interval. A marked case is bold, with 🟢 faster or 🔴 slower. The change is the median of the differences within a round, so it can differ from the difference of the two medians. The row of a case that was run again shows those runs.
- "Not confirmed in the second runs" lists the cases whose first runs showed a change that the second runs did not.
- "Wall time" shows the same with the wall time.
- "What each case loads" shows the number of the files of each package of gunshi (for example `gunshi 2`) and of the other dependencies, the built-in modules, the ICU services, and the bytes of the files. A case that loads other files or uses ICU differently with the head is bold in the head column. These do not depend on the machine, so a change there comes from the code.
