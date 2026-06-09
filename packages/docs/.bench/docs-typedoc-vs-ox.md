# 2026-06-06 — docs API generators benchmark (typedoc vs ox-content)

Benchmark of the two API reference generators in `packages/docs`, measured with [hyperfine](https://github.com/sharkdp/hyperfine). Binaries are invoked directly (no pnpm wrapper) to capture pure tool execution time. `build:typedoc` emits Markdown via TypeDoc combined with the `typedoc-plugin-markdown` and `typedoc-vitepress-theme` plugins; `build:ox-content` uses ox-content.

## Environment

| Item          | Value                    |
| ------------- | ------------------------ |
| Date          | 2026-06-06T05:55:49.890Z |
| OS            | darwin 24.5.0 (arm64)    |
| CPU           | Apple M1 Max × 10        |
| Node.js       | v24.16.0                 |
| hyperfine     | 1.19.0                   |
| warmup / runs | 1 / 10                   |

## Targets

| Command                    | Actual command                          | Key versions                                                                   | Output       |
| -------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ | ------------ |
| `build:typedoc` (baseline) | `typedoc --excludeInternal`             | typedoc 0.28.19, typedoc-plugin-markdown 4.11.0, typedoc-vitepress-theme 1.1.2 | `src/api`    |
| `build:ox-content`         | `node generate-api-with-ox-content.mjs` | @ox-content/napi 2.57.0, Node.js v24.16.0                                      | `src/api-ox` |

## Results (baseline: build:typedoc)

| Command            |    Mean |  Median |     p95 |  Stddev |     Min |     Max | vs build:typedoc |
| ------------------ | ------: | ------: | ------: | ------: | ------: | ------: | ---------------: |
| `build:typedoc`    | 2.146 s | 2.117 s | 2.223 s | 0.058 s | 2.084 s | 2.226 s | 1.00× (baseline) |
| `build:ox-content` | 0.281 s | 0.279 s | 0.298 s | 0.012 s | 0.266 s | 0.301 s |     7.63× faster |

## Summary

- `build:ox-content` is **7.63× faster** than `build:typedoc` (mean 0.281 s vs 2.146 s).
